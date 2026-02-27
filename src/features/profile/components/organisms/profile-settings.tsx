'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { UserProfile } from '@/types';
import { Camera } from 'lucide-react';

interface ProfileSettingsProps {
  profile: UserProfile | null;
  savingProfile: boolean;
  displayName: string;
  setDisplayName: (val: string) => void;
  bio: string;
  setBio: (val: string) => void;
  avatarUrl: string;
  setAvatarUrl: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  website: string;
  setWebsite: (val: string) => void;
  socialLinks: {
    twitter: string;
    instagram: string;
    facebook: string;
    youtube: string;
    tiktok: string;
  };
  setSocialLinks: (val: any) => void;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      comments: boolean;
      likes: boolean;
    };
  };
  setPreferences: (val: any) => void;
  handleSaveProfile: () => void;
  getInitials: (username: string) => string;
}

export function ProfileSettings({
  profile,
  savingProfile,
  displayName,
  setDisplayName,
  bio,
  setBio,
  avatarUrl,
  setAvatarUrl,
  email,
  setEmail,
  phone,
  setPhone,
  location,
  setLocation,
  website,
  setWebsite,
  socialLinks,
  setSocialLinks,
  preferences,
  setPreferences,
  handleSaveProfile,
  getInitials,
}: ProfileSettingsProps) {
  return (
    <div className="space-y-4 max-w-xl">
      <h1 className="text-2xl md:text-3xl font-manga text-amber-400">
        Your Profile
      </h1>
      <p className="text-sm text-zinc-400">
        Edit your personal information and manage public stories on the
        community.
      </p>

      <div className="space-y-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
        {/* Avatar Section */}
        <div className="flex items-center gap-4 pb-4 border-b border-zinc-800">
          <div className="relative">
            <Avatar className="h-20 w-20 border-2 border-amber-400/50">
              <AvatarImage
                src={avatarUrl}
                alt={displayName || profile?.username}
              />
              <AvatarFallback className="bg-zinc-800 text-amber-400 text-xl font-semibold">
                {profile ? getInitials(displayName || profile.username) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-zinc-900 rounded-full p-1.5 border border-zinc-700">
              <Camera className="h-3 w-3 text-amber-400" />
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs text-zinc-400">Avatar URL</label>
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="bg-zinc-950 border-zinc-700 text-sm"
            />
            <p className="text-[10px] text-zinc-500">
              Enter your avatar image URL
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-zinc-400">Display Name</label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="bg-zinc-950 border-zinc-700 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">About / Bio</label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="bg-zinc-950 border-zinc-700 text-sm resize-none"
          />
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="space-y-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">
          Contact Information
        </h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-zinc-950 border-zinc-700 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Phone Number</label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+84 xxx xxx xxx"
              className="bg-zinc-950 border-zinc-700 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Address</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              className="bg-zinc-950 border-zinc-700 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Website</label>
            <Input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="bg-zinc-950 border-zinc-700 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Social Links Section */}
      <div className="space-y-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">
          Social Media
        </h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Twitter/X</label>
            <Input
              value={socialLinks.twitter}
              onChange={(e) =>
                setSocialLinks({ ...socialLinks, twitter: e.target.value })
              }
              placeholder="@username hoặc URL"
              className="bg-zinc-950 border-zinc-700 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Instagram</label>
            <Input
              value={socialLinks.instagram}
              onChange={(e) =>
                setSocialLinks({
                  ...socialLinks,
                  instagram: e.target.value,
                })
              }
              placeholder="@username hoặc URL"
              className="bg-zinc-950 border-zinc-700 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Facebook</label>
            <Input
              value={socialLinks.facebook}
              onChange={(e) =>
                setSocialLinks({ ...socialLinks, facebook: e.target.value })
              }
              placeholder="Facebook URL"
              className="bg-zinc-950 border-zinc-700 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">YouTube</label>
            <Input
              value={socialLinks.youtube}
              onChange={(e) =>
                setSocialLinks({ ...socialLinks, youtube: e.target.value })
              }
              placeholder="YouTube URL"
              className="bg-zinc-950 border-zinc-700 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">TikTok</label>
            <Input
              value={socialLinks.tiktok}
              onChange={(e) =>
                setSocialLinks({ ...socialLinks, tiktok: e.target.value })
              }
              placeholder="@username or URL"
              className="bg-zinc-950 border-zinc-700 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="space-y-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">
          Preferences
        </h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Interface Theme</label>
            <select
              value={preferences.theme}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  theme: e.target.value as 'light' | 'dark' | 'auto',
                })
              }
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
            >
              <option value="auto">Auto</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Language</label>
            <select
              value={preferences.language}
              onChange={(e) =>
                setPreferences({ ...preferences, language: e.target.value })
              }
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
            >
              <option value="vi">Vietnamese</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
            </select>
          </div>
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <label className="text-xs text-zinc-400">Notifications</label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-300">Email</span>
                <Switch
                  checked={preferences.notifications.email}
                  onCheckedChange={(checked: boolean) =>
                    setPreferences({
                      ...preferences,
                      notifications: {
                        ...preferences.notifications,
                        email: checked,
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-300">Push</span>
                <Switch
                  checked={preferences.notifications.push}
                  onCheckedChange={(checked: boolean) =>
                    setPreferences({
                      ...preferences,
                      notifications: {
                        ...preferences.notifications,
                        push: checked,
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-300">Comments</span>
                <Switch
                  checked={preferences.notifications.comments}
                  onCheckedChange={(checked: boolean) =>
                    setPreferences({
                      ...preferences,
                      notifications: {
                        ...preferences.notifications,
                        comments: checked,
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-300">Likes</span>
                <Switch
                  checked={preferences.notifications.likes}
                  onCheckedChange={(checked: boolean) =>
                    setPreferences({
                      ...preferences,
                      notifications: {
                        ...preferences.notifications,
                        likes: checked,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSaveProfile}
        disabled={!profile || savingProfile}
        className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {savingProfile ? 'Saving...' : 'Save all changes'}
      </button>
    </div>
  );
}
