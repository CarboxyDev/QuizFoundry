import { axiosInstance } from "./axios";

export interface UpdateProfileInput {
  name?: string;
  bio?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  data: {
    id: string;
    name: string | null;
    role: string | null;
    avatar_url: string | null;
    bio: string | null;
    created_at: string;
  };
}

export interface UploadAvatarResponse {
  success: boolean;
  data: {
    avatar_url: string;
  };
}

/**
 * Update user profile (name, bio)
 */
export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<UpdateProfileResponse["data"]> {
  const response = await axiosInstance.put<UpdateProfileResponse>(
    `/users/${userId}`,
    input,
  );

  if (!response.data.success) {
    throw new Error("Failed to update profile");
  }

  return response.data.data;
}

/**
 * Upload user avatar
 */
export async function uploadAvatar(
  userId: string,
  file: File,
): Promise<string> {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await axiosInstance.post<UploadAvatarResponse>(
    `/users/${userId}/avatar`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  if (!response.data.success) {
    throw new Error("Failed to upload avatar");
  }

  return response.data.data.avatar_url;
}
