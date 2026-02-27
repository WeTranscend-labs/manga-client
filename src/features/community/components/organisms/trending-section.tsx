'use client';

import { MangaProject } from '@/types';
import { Eye, Heart, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface TrendingSectionProps {
  trendingLoading: boolean;
  trendingProjects: MangaProject[];
}

export function TrendingSection({
  trendingLoading,
  trendingProjects,
}: TrendingSectionProps) {
  if (trendingLoading || trendingProjects.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-amber-400" />
        <h2 className="text-lg font-semibold text-zinc-200">Đang thịnh hành</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {trendingProjects.map((project) => (
          <Link
            key={`trending-${project.ownerId}-${project.id}`}
            href={`/community/${encodeURIComponent(project.ownerId!)}/${encodeURIComponent(
              project.id,
            )}`}
            className="group rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-amber-400/70 transition-all"
          >
            <div className="h-24 bg-zinc-800/80 flex items-center justify-center relative">
              {project.coverImageUrl ? (
                <Image
                  src={project.coverImageUrl}
                  alt={project.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 16vw"
                />
              ) : project.pages?.[0]?.url ? (
                <Image
                  src={project.pages[0].url}
                  alt={project.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 16vw"
                />
              ) : (
                <span className="text-[10px] text-zinc-500">No preview</span>
              )}
            </div>
            <div className="px-2 py-2">
              <div className="text-xs font-semibold truncate mb-1">
                {project.title || 'Untitled'}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                <span className="flex items-center gap-0.5">
                  <Eye className="h-3 w-3" />
                  {project.viewCount || 0}
                </span>
                <span className="flex items-center gap-0.5">
                  <Heart className="h-3 w-3" />
                  {project.likeCount || 0}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
