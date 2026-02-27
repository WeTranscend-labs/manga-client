'use client';

import { MangaProject } from '@/types';
import { Eye, Heart, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ProjectGridProps {
  loading: boolean;
  projects: MangaProject[];
  searchQuery: string;
  selectedTags: string[];
  hasMore: boolean;
  handleLoadMore: () => void;
}

export function ProjectGrid({
  loading,
  projects,
  searchQuery,
  selectedTags,
  hasMore,
  handleLoadMore,
}: ProjectGridProps) {
  if (loading && projects.length === 0) {
    return (
      <div className="flex justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <div className="text-zinc-400 text-sm">Đang tải community...</div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-24 text-zinc-500 text-sm">
        {searchQuery || selectedTags.length > 0
          ? 'Không tìm thấy truyện nào phù hợp với bộ lọc của bạn.'
          : 'Chưa có tập truyện public nào. Hãy là người đầu tiên public truyện trong trang Profile.'}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((project) => (
          <Link
            key={`${project.ownerId || 'unknown'}-${project.id}`}
            href={
              project.ownerId
                ? `/community/${encodeURIComponent(project.ownerId)}/${encodeURIComponent(project.id)}`
                : '#'
            }
            className={project.ownerId ? '' : 'pointer-events-none opacity-60'}
          >
            <div className="group rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-amber-400/70 hover:shadow-[0_0_35px_rgba(251,191,36,0.25)] transition-all h-full flex flex-col">
              <div className="h-40 bg-zinc-800/80 flex items-center justify-center relative overflow-hidden">
                {project.coverImageUrl ? (
                  <Image
                    src={project.coverImageUrl}
                    alt={project.title || 'Manga cover'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : project.pages?.[0]?.url ? (
                  <Image
                    src={project.pages[0].url}
                    alt={project.title || 'Manga cover'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <span className="text-xs text-zinc-500 opacity-70">
                    {project.pages?.length
                      ? `${project.pages.length} pages`
                      : 'Chưa có ảnh preview'}
                  </span>
                )}
                {project.tags && project.tags.length > 0 && (
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {project.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] text-amber-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="px-4 py-3 space-y-2 flex-1 flex flex-col">
                <div className="space-y-1">
                  <div className="text-sm font-semibold truncate">
                    {project.title || 'Untitled project'}
                  </div>
                  <div className="text-xs text-zinc-500 line-clamp-2">
                    {project.description || 'Không có mô tả'}
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-auto pt-2">
                  <div>
                    Tác giả:{' '}
                    <span className="text-zinc-200">
                      {project.ownerDisplayName || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {project.viewCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {project.likeCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {project.commentCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-zinc-800 text-zinc-200 text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Đang tải...' : 'Tải thêm'}
          </button>
        </div>
      )}
    </>
  );
}
