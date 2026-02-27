'use client';

import { Page } from '@/components/layout/page';
import { communityService } from '@/services/community.service';
import {
  storageService,
  type FetchPublicProjectsOptions,
} from '@/services/storage.service';
import type { MangaProject } from '@/types';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { CommunityFilters } from '../components/organisms/community-filters';
import { ProjectGrid } from '../components/organisms/project-grid';
import { TrendingSection } from '../components/organisms/trending-section';

export type SortOption =
  | 'newest'
  | 'oldest'
  | 'mostLiked'
  | 'mostViewed'
  | 'mostCommented'
  | 'trending';

export function CommunityPage() {
  const [projects, setProjects] = useState<MangaProject[]>([]);
  const [trendingProjects, setTrendingProjects] = useState<MangaProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const limit = 18;

  const loadProjects = useCallback(
    async (pageIndex: number, reset: boolean = false) => {
      const currentPage = pageIndex;
      setLoading(true);

      try {
        const options: FetchPublicProjectsOptions = {
          limit,
          offset: currentPage * limit,
          search: searchQuery || undefined,
          sortBy: sortBy === 'newest' ? undefined : sortBy,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
        };

        const result = await storageService.fetchPublicProjects(options);

        if (reset) {
          setProjects(result.projects);
          setPage(0);
        } else {
          setProjects((prev) => [...prev, ...result.projects]);
        }

        setTotal(result.total);
        setHasMore((currentPage + 1) * limit < result.total);
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, sortBy, selectedTags, limit],
  );

  useEffect(() => {
    loadProjects(0, true);
  }, [loadProjects]);

  useEffect(() => {
    const loadTrending = async () => {
      try {
        const trending = await communityService.fetchTrendingProjects(6);
        setTrendingProjects(trending);
      } catch (error) {
        console.error('Failed to load trending:', error);
      } finally {
        setTrendingLoading(false);
      }
    };
    loadTrending();
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadProjects(nextPage, false);
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  // Extract all unique tags from projects
  const allTags = Array.from(
    new Set(projects.flatMap((p) => p.tags || [])),
  ).slice(0, 10);

  return (
    <Page className="py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-manga text-amber-400">
            Community
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Khám phá các tập truyện mà cộng đồng đã public từ Manga Studio.
          </p>
        </div>
        <Link
          href="/profile"
          className="inline-flex items-center px-4 py-2 rounded-lg border border-zinc-700 text-xs font-semibold text-zinc-200 hover:bg-zinc-800/60 transition-colors"
        >
          Quản lý truyện của bạn
        </Link>
      </div>

      {/* Trending Section */}
      <TrendingSection
        trendingLoading={trendingLoading}
        trendingProjects={trendingProjects}
      />

      {/* Search and Filters */}
      <CommunityFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        allTags={allTags}
        selectedTags={selectedTags}
        handleTagToggle={handleTagToggle}
        setSelectedTags={setSelectedTags}
      />

      {/* Results Count */}
      {!loading && (
        <div className="text-sm text-zinc-400">
          Tìm thấy {total} {total === 1 ? 'truyện' : 'truyện'}
        </div>
      )}

      {/* Projects Grid */}
      <ProjectGrid
        loading={loading}
        projects={projects}
        searchQuery={searchQuery}
        selectedTags={selectedTags}
        hasMore={hasMore}
        handleLoadMore={handleLoadMore}
      />
    </Page>
  );
}
