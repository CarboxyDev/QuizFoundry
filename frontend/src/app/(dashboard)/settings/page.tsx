"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/auth/useAuth";
import { motion } from "framer-motion";
import { Save, Settings, User } from "lucide-react";
import { useState } from "react";
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

export default function SettingsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || "",
    bio: "",
    avatar: user?.avatar_url || "",
  });

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 flex flex-1 flex-col gap-4 p-4 pt-0">
      <motion.div
        className="from-background via-muted/30 to-muted/50 min-h-screen flex-1 bg-gradient-to-br"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto max-w-4xl px-4 py-8">
          {/* Header */}
          <motion.div
            className="mb-8"
            variants={headerVariants}
            initial="initial"
            animate="animate"
          >
            <div className="mb-2 flex items-center gap-3">
              <div className="bg-primary/10 text-primary rounded-lg p-2">
                <Settings className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
            </div>
            <p className="text-muted-foreground">
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
              <Card className="bg-card/60 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        Profile Information
                      </CardTitle>
                      <p className="text-muted-foreground text-sm">
                        Update your personal details and profile picture
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile.avatar} alt={profile.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        {profile.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Button variant="outline" size="sm" className="mb-2">
                        Change Avatar
                      </Button>
                      <p className="text-muted-foreground text-sm">
                        JPG, PNG or GIF. Max size of 5MB.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      value={profile.bio}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, bio: e.target.value }))
                      }
                      className="bg-background/50 min-h-[80px]"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={isLoading}>
                      <Save className="mr-2 h-4 w-4" />
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Preferences Section */}
            {/* <motion.div variants={cardVariants}>
              <Card className="bg-card/60 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-green-500/10 p-2 text-green-500">
                      <Palette className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        General Preferences
                      </CardTitle>
                      <p className="text-muted-foreground text-sm">
                        Customize your experience and notification settings
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className="text-muted-foreground h-4 w-4" />
                        <div>
                          <Label>Push Notifications</Label>
                          <p className="text-muted-foreground text-sm">
                            Receive notifications about quiz activities
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.notifications}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({
                            ...prev,
                            notifications: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Globe className="text-muted-foreground h-4 w-4" />
                        <div>
                          <Label>Email Notifications</Label>
                          <p className="text-muted-foreground text-sm">
                            Get email updates about your quizzes
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.emailNotifications}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({
                            ...prev,
                            emailNotifications: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Volume2 className="text-muted-foreground h-4 w-4" />
                        <div>
                          <Label>Sound Effects</Label>
                          <p className="text-muted-foreground text-sm">
                            Play sounds for quiz interactions
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.soundEffects}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({
                            ...prev,
                            soundEffects: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Save className="text-muted-foreground h-4 w-4" />
                        <div>
                          <Label>Auto-save</Label>
                          <p className="text-muted-foreground text-sm">
                            Automatically save quiz progress
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.autoSave}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({
                            ...prev,
                            autoSave: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Eye className="text-muted-foreground h-4 w-4" />
                        <div>
                          <Label>Public Profile</Label>
                          <p className="text-muted-foreground text-sm">
                            Make your profile visible to other users
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.publicProfile}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({
                            ...prev,
                            publicProfile: checked,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSavePreferences}
                      disabled={isLoading}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isLoading ? "Saving..." : "Save Preferences"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div> */}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
