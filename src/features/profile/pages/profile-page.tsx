'use client';

import { Page } from '@/components/layout/page';
import { LoadingPage } from '@/components/ui/loading';
import { storageService } from '@/services/storage.service';
import { userService } from '@/services/user.service';
import type { MangaProject, UserProfile } from '@/types';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { WelcomeBanners } from '../components/molecules/welcome-banners';
import { ProfileProjects } from '../components/organisms/profile-projects';
import { ProfileSettings } from '../components/organisms/profile-settings';

function ProfileContent() {
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<MangaProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingProjectId, setSavingProjectId] = useState<string | null>(null);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [socialLinks, setSocialLinks] = useState({
    twitter: '',
    instagram: '',
    facebook: '',
    youtube: '',
    tiktok: '',
  });
  const [preferences, setPreferences] = useState({
    theme: 'auto' as 'light' | 'dark' | 'auto',
    language: 'vi',
    notifications: {
      email: true,
      push: true,
      comments: true,
      likes: true,
    },
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [p, proj] = await Promise.all([
          userService.getMyProfile(),
          storageService.fetchMyProjects(),
        ]);
        setProfile(p);
        setProjects(proj);
        if (p) {
          setDisplayName(p.displayName || p.username);
          setBio(p.bio || '');
          setAvatarUrl(p.avatarUrl || '');
          setEmail(p.email || '');
          setPhone(p.phone || '');
          setLocation(p.location || '');
          setWebsite(p.website || '');
          setSocialLinks({
            twitter: p.socialLinks?.twitter || '',
            instagram: p.socialLinks?.instagram || '',
            facebook: p.socialLinks?.facebook || '',
            youtube: p.socialLinks?.youtube || '',
            tiktok: p.socialLinks?.tiktok || '',
          });
          setPreferences({
            theme: p.preferences?.theme || 'auto',
            language: p.preferences?.language || 'vi',
            notifications: {
              email: p.preferences?.notifications?.email ?? true,
              push: p.preferences?.notifications?.push ?? true,
              comments: p.preferences?.notifications?.comments ?? true,
              likes: p.preferences?.notifications?.likes ?? true,
            },
          });
        }
      } catch {
        // errors are handled by api layer
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    // Show welcome banner if coming from registration
    if (searchParams.get('welcome') === 'true') {
      setShowWelcomeBanner(true);
      toast.success('Welcome to Manga Studio! Please complete your profile.');
    }
  }, [searchParams]);

  // Check if profile is incomplete
  const isProfileIncomplete =
    profile && (!profile.displayName || !profile.bio || !profile.avatarUrl);

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSavingProfile(true);
    try {
      const updated = await userService.updateMyProfile({
        displayName: displayName.trim() || profile.username,
        bio,
        avatarUrl: avatarUrl.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
        website: website.trim() || undefined,
        socialLinks: {
          twitter: socialLinks.twitter.trim() || undefined,
          instagram: socialLinks.instagram.trim() || undefined,
          facebook: socialLinks.facebook.trim() || undefined,
          youtube: socialLinks.youtube.trim() || undefined,
          tiktok: socialLinks.tiktok.trim() || undefined,
        },
        preferences,
      });
      setProfile(updated);
      if (updated) {
        setAvatarUrl(updated.avatarUrl || '');
        setEmail(updated.email || '');
        setPhone(updated.phone || '');
        setLocation(updated.location || '');
        setWebsite(updated.website || '');
        setSocialLinks({
          twitter: updated.socialLinks?.twitter || '',
          instagram: updated.socialLinks?.instagram || '',
          facebook: updated.socialLinks?.facebook || '',
          youtube: updated.socialLinks?.youtube || '',
          tiktok: updated.socialLinks?.tiktok || '',
        });
        setPreferences({
          theme: updated.preferences?.theme || 'auto',
          language: updated.preferences?.language || 'vi',
          notifications: {
            email: updated.preferences?.notifications?.email ?? true,
            push: updated.preferences?.notifications?.push ?? true,
            comments: updated.preferences?.notifications?.comments ?? true,
            likes: updated.preferences?.notifications?.likes ?? true,
          },
        });
        // Hide welcome banner after first save
        setShowWelcomeBanner(false);
      }
      toast.success('Profile updated successfully');
    } catch {
      // handled in api
    } finally {
      setSavingProfile(false);
    }
  };

  const getInitials = (username: string | undefined | null) => {
    if (!username) return 'U';
    return username.substring(0, 2).toUpperCase();
  };

  const [projectTags, setProjectTags] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (projects.length > 0) {
      const tagsMap: Record<string, string[]> = {};
      projects.forEach((p) => {
        tagsMap[p.id] = p.tags || [];
      });
      setProjectTags(tagsMap);
    }
  }, [projects]);

  const handleTogglePublic = async (project: MangaProject, value: boolean) => {
    setSavingProjectId(project.id);
    try {
      await storageService.updateProjectMeta(project.id, { isPublic: value });
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, isPublic: value } : p)),
      );
      toast.success(
        value ? 'Story published to community' : 'Story hidden from community',
      );
    } catch {
      // handled in api
    } finally {
      setSavingProjectId(null);
    }
  };

  const handleUpdateTags = async (projectId: string, tags: string[]) => {
    setSavingProjectId(projectId);
    try {
      await storageService.updateProjectMeta(projectId, { tags });
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, tags } : p)),
      );
      setProjectTags((prev) => ({ ...prev, [projectId]: tags }));
      toast.success('Tags updated');
    } catch {
      // handled in api
    } finally {
      setSavingProjectId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <div className="text-zinc-400 text-sm">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      <WelcomeBanners
        showWelcomeBanner={showWelcomeBanner}
        setShowWelcomeBanner={setShowWelcomeBanner}
        isProfileIncomplete={isProfileIncomplete}
      />

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <ProfileSettings
          profile={profile}
          savingProfile={savingProfile}
          displayName={displayName}
          setDisplayName={setDisplayName}
          bio={bio}
          setBio={setBio}
          avatarUrl={avatarUrl}
          setAvatarUrl={setAvatarUrl}
          email={email}
          setEmail={setEmail}
          phone={phone}
          setPhone={setPhone}
          location={location}
          setLocation={setLocation}
          website={website}
          setWebsite={setWebsite}
          socialLinks={socialLinks}
          setSocialLinks={setSocialLinks}
          preferences={preferences}
          setPreferences={setPreferences}
          handleSaveProfile={handleSaveProfile}
          getInitials={getInitials}
        />
      </div>

      <ProfileProjects
        projects={projects}
        projectTags={projectTags}
        setProjectTags={setProjectTags}
        savingProjectId={savingProjectId}
        handleTogglePublic={handleTogglePublic}
        handleUpdateTags={handleUpdateTags}
      />
    </div>
  );
}

export function ProfilePage(_props: any) {
  return (
    <Page className="py-10">
      <Suspense
        fallback={
          <LoadingPage className="py-24" message="Loading profile..." />
        }
      >
        <ProfileContent />
      </Suspense>
    </Page>
  );
}
