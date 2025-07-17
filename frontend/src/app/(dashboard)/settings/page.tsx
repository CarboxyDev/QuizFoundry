"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/auth/useAuth";
import { updateProfile, uploadAvatar } from "@/lib/user-api";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  AlertCircle,
  LogOut,
  Save,
  Settings,
  Upload,
  User,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const headerVariants = {
  initial: { opacity: 0, y: -30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const VALIDATION_RULES = {
  name: {
    min: 2,
    max: 50,
  },
  bio: {
    max: 500,
  },
  avatar: {
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  },
} as const;

interface ValidationErrors {
  name?: string;
  bio?: string;
}

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    avatar: user?.avatar_url || "",
  });

  const [initialProfile, setInitialProfile] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
  });

  useEffect(() => {
    if (user) {
      const newProfile = {
        name: user.name || "",
        bio: user.bio || "",
        avatar: user.avatar_url || "",
      };
      setProfile(newProfile);
      setInitialProfile({
        name: user.name || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  useEffect(() => {
    const hasChanges =
      profile.name !== initialProfile.name ||
      profile.bio !== initialProfile.bio;
    setHasUnsavedChanges(hasChanges);
  }, [profile, initialProfile]);

  const validateName = useCallback((name: string): string | undefined => {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      return "Name is required";
    }
    if (trimmed.length < VALIDATION_RULES.name.min) {
      return `Name must be at least ${VALIDATION_RULES.name.min} characters`;
    }
    if (trimmed.length > VALIDATION_RULES.name.max) {
      return `Name must not exceed ${VALIDATION_RULES.name.max} characters`;
    }
    return undefined;
  }, []);

  const validateBio = useCallback((bio: string): string | undefined => {
    if (bio.length > VALIDATION_RULES.bio.max) {
      return `Bio must not exceed ${VALIDATION_RULES.bio.max} characters`;
    }
    if (bio.trim() !== bio && bio.trim().length > 0) {
      return "Bio cannot contain leading or trailing whitespace";
    }
    return undefined;
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    const nameError = validateName(profile.name);
    if (nameError) newErrors.name = nameError;

    const bioError = validateBio(profile.bio);
    if (bioError) newErrors.bio = bioError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [profile, validateName, validateBio]);

  const handleInputChange = useCallback(
    (field: "name" | "bio", value: string) => {
      setProfile((prev) => ({ ...prev, [field]: value }));

      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  const handleSaveProfile = async () => {
    if (!user) return;

    if (!validateForm()) {
      toast.error("Please fix the validation errors before saving");
      return;
    }

    setIsLoading(true);
    try {
      const updateData: Record<string, any> = {};

      if (profile.name !== initialProfile.name) {
        updateData.name = profile.name.trim();
      }

      if (profile.bio !== initialProfile.bio) {
        const trimmedBio = profile.bio.trim();
        updateData.bio = trimmedBio;
      }

      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to save");
        return;
      }

      const updatedProfile = await updateProfile(user.id, updateData);

      updateUser({
        ...user,
        name: updatedProfile.name,
        bio: updatedProfile.bio,
      });

      setInitialProfile({
        name: updatedProfile.name || "",
        bio: updatedProfile.bio || "",
      });

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const validateAvatarFile = (file: File): string | null => {
    if (file.size > VALIDATION_RULES.avatar.maxSize) {
      return "File size must be less than 5MB";
    }

    if (!VALIDATION_RULES.avatar.allowedTypes.includes(file.type as any)) {
      return "Please select a JPEG, PNG, GIF, or WebP image";
    }

    return null;
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;

    const validationError = validateAvatarFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const avatarUrl = await uploadAvatar(user.id, file);

      setProfile((prev) => ({ ...prev, avatar: avatarUrl }));

      updateUser({
        ...user,
        avatar_url: avatarUrl,
      });

      toast.success("Avatar updated successfully!");
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to upload avatar";
      toast.error(errorMessage);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const nameCharCount = profile.name.length;
  const bioCharCount = profile.bio.length;

  const getCharCountColor = (count: number, max: number) => {
    if (count > max) return "text-red-500";
    if (count > max * 0.8) return "text-orange-500";
    return "text-muted-foreground";
  };

  return (
    <div className="mt-4 flex flex-1 flex-col gap-4 p-4 pt-0">
      <motion.div
        className={cn(
          "from-background via-muted/30 to-muted/50 min-h-screen flex-1 bg-gradient-to-br",
        )}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            className="mb-8"
            variants={headerVariants}
            initial="initial"
            animate="animate"
          >
            <div className="mb-2 flex items-center gap-3">
              <div className={cn("bg-primary/10 text-primary rounded-lg p-2")}>
                <Settings className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
            </div>
            <p className={cn("text-muted-foreground")}>
              Manage your account settings and preferences
            </p>
          </motion.div>

          <motion.div
            className="space-y-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={cardVariants}>
              <Card className={cn("bg-card/60 backdrop-blur-sm")}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        Profile Information
                      </CardTitle>
                      <p className={cn("text-muted-foreground text-sm")}>
                        Update your personal details and profile picture
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile.avatar} alt={profile.name} />
                      <AvatarFallback
                        className={cn("bg-primary/10 text-primary text-xl")}
                      >
                        {profile.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="mb-2"
                        onClick={triggerFileInput}
                        disabled={isUploadingAvatar}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {isUploadingAvatar ? "Uploading..." : "Change Avatar"}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <p className={cn("text-muted-foreground text-sm")}>
                        JPEG, PNG, GIF, or WebP. Max size of 5MB.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      Full Name
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className={cn(
                        "bg-background/50",
                        errors.name &&
                          "border-red-500 focus-visible:ring-red-500",
                      )}
                      maxLength={VALIDATION_RULES.name.max}
                    />
                    <div className="flex items-center justify-between">
                      {errors.name && (
                        <div className="flex items-center gap-1 text-sm text-red-500">
                          <AlertCircle className="h-4 w-4" />
                          {errors.name}
                        </div>
                      )}
                      <span
                        className={cn(
                          "ml-auto text-sm",
                          getCharCountColor(
                            nameCharCount,
                            VALIDATION_RULES.name.max,
                          ),
                        )}
                      >
                        {nameCharCount}/{VALIDATION_RULES.name.max}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      value={profile.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      className={cn(
                        "bg-background/50 min-h-[80px] resize-none",
                        errors.bio &&
                          "border-red-500 focus-visible:ring-red-500",
                      )}
                      maxLength={VALIDATION_RULES.bio.max}
                    />
                    <div className="flex items-center justify-between">
                      {errors.bio && (
                        <div className="flex items-center gap-1 text-sm text-red-500">
                          <AlertCircle className="h-4 w-4" />
                          {errors.bio}
                        </div>
                      )}
                      <span
                        className={cn(
                          "ml-auto text-sm",
                          getCharCountColor(
                            bioCharCount,
                            VALIDATION_RULES.bio.max,
                          ),
                        )}
                      >
                        {bioCharCount}/{VALIDATION_RULES.bio.max}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {hasUnsavedChanges && (
                      <p className="text-sm text-amber-500">
                        You have unsaved changes
                      </p>
                    )}
                    <Button
                      onClick={handleSaveProfile}
                      disabled={
                        isLoading ||
                        !hasUnsavedChanges ||
                        Object.keys(errors).length > 0
                      }
                      className="ml-auto"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className={cn("bg-card/60 backdrop-blur-sm")}>
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 p-3 text-cyan-500 shadow-sm">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        Account Management
                      </CardTitle>
                      <p className={cn("text-muted-foreground text-sm")}>
                        Manage your account access and session
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="rounded-lg border border-red-200/50 bg-red-50/50 p-4 dark:border-red-800/30 dark:bg-red-950/20">
                      <h3 className="mb-2 flex items-center gap-2 font-semibold dark:text-red-600">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </h3>
                      <p
                        className={cn(
                          "mb-4 text-sm leading-relaxed text-red-600/80 dark:text-red-400/80",
                        )}
                      >
                        End your current session and return to the login page.
                        You&apos;ll need to sign in again to access your
                        account.
                      </p>
                      <Button
                        variant="destructive"
                        onClick={logout}
                        className="group relative overflow-hidden bg-gradient-to-r from-red-500 to-red-600 transition-all duration-200 hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-500/25"
                      >
                        <LogOut className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
