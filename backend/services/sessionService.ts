import crypto from "crypto";
import supabase, { supabaseAdmin } from "../lib/supabase";
import { AppError } from "../errors/AppError";

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  refresh_token?: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  user_agent?: string;
  ip_address?: string;
  is_active: boolean;
}

export interface CreateSessionData {
  userId: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface SessionValidationResult {
  isValid: boolean;
  session?: UserSession;
  user?: {
    id: string;
    email: string;
    avatar_url?: string;
  };
}

const SESSION_DURATION_DAYS = 30;
const TOKEN_LENGTH = 64;

function generateSecureToken(): string {
  return crypto.randomBytes(TOKEN_LENGTH).toString("hex");
}

export async function createSession(
  sessionData: CreateSessionData
): Promise<UserSession> {
  const sessionToken = generateSecureToken();
  const refreshToken = generateSecureToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  const { data, error } = await supabaseAdmin
    .from("user_sessions")
    .insert({
      user_id: sessionData.userId,
      session_token: sessionToken,
      refresh_token: refreshToken,
      expires_at: expiresAt.toISOString(),
      user_agent: sessionData.userAgent || null,
      ip_address: sessionData.ipAddress || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    throw new AppError(`Failed to create session: ${error.message}`, 500);
  }

  // Clean up any old expired sessions for this user
  await cleanupUserExpiredSessions(sessionData.userId);

  return data;
}

export async function validateSession(
  sessionToken: string
): Promise<SessionValidationResult> {
  if (!sessionToken) {
    return { isValid: false };
  }

  const { data: sessionData, error: sessionError } = await supabaseAdmin
    .from("user_sessions")
    .select("*")
    .eq("session_token", sessionToken)
    .eq("is_active", true)
    .single();

  if (sessionError || !sessionData) {
    return { isValid: false };
  }

  const now = new Date();
  const expiresAt = new Date(sessionData.expires_at);

  if (now > expiresAt) {
    // Mark session as inactive
    await invalidateSession(sessionToken);
    return { isValid: false };
  }

  const { data: userData, error: userError } =
    await supabaseAdmin.auth.admin.getUserById(sessionData.user_id);

  if (userError || !userData.user) {
    return { isValid: false };
  }

  await supabaseAdmin
    .from("user_sessions")
    .update({ updated_at: new Date().toISOString() })
    .eq("session_token", sessionToken);

  return {
    isValid: true,
    session: sessionData,
    user: {
      id: userData.user.id,
      email: userData.user.email || "",
      avatar_url:
        userData.user.user_metadata?.avatar_url ||
        userData.user.user_metadata?.picture ||
        null,
    },
  };
}

export async function refreshSession(
  sessionToken: string
): Promise<UserSession | null> {
  const validation = await validateSession(sessionToken);

  if (!validation.isValid || !validation.session) {
    return null;
  }

  const newExpiresAt = new Date();
  newExpiresAt.setDate(newExpiresAt.getDate() + SESSION_DURATION_DAYS);

  const { data, error } = await supabaseAdmin
    .from("user_sessions")
    .update({
      expires_at: newExpiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("session_token", sessionToken)
    .select()
    .single();

  if (error) {
    throw new AppError(`Failed to refresh session: ${error.message}`, 500);
  }

  return data;
}

export async function invalidateSession(sessionToken: string): Promise<void> {
  await supabaseAdmin
    .from("user_sessions")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("session_token", sessionToken);
}

export async function invalidateAllUserSessions(userId: string): Promise<void> {
  await supabaseAdmin
    .from("user_sessions")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
}

export async function cleanupUserExpiredSessions(
  userId: string
): Promise<void> {
  const now = new Date().toISOString();

  await supabaseAdmin
    .from("user_sessions")
    .delete()
    .eq("user_id", userId)
    .or(`expires_at.lt.${now},is_active.eq.false`);
}

/**
 * ! Clean up all expired sessions (for scheduled cleanup)
 */
export async function cleanupAllExpiredSessions(): Promise<void> {
  const { error } = await supabaseAdmin.rpc("cleanup_expired_sessions");

  if (error) {
    console.error("Failed to cleanup expired sessions:", error);
  }
}

export async function getUserSessions(userId: string): Promise<UserSession[]> {
  const { data, error } = await supabaseAdmin
    .from("user_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new AppError(`Failed to fetch user sessions: ${error.message}`, 500);
  }

  return data || [];
}
