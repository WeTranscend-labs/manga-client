'use client';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { MangaProject } from '@/types';
import Image from 'next/image';

interface ProfileProjectsProps {
  projects: MangaProject[];
  projectTags: Record<string, string[]>;
  setProjectTags: React.Dispatch<
    React.SetStateAction<Record<string, string[]>>
  >;
  savingProjectId: string | null;
  handleTogglePublic: (project: MangaProject, value: boolean) => void;
  handleUpdateTags: (projectId: string, tags: string[]) => void;
}

export function ProfileProjects({
  projects,
  projectTags,
  setProjectTags,
  savingProjectId,
  handleTogglePublic,
  handleUpdateTags,
}: ProfileProjectsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg md:text-xl font-manga text-zinc-100">
        Your Story Collection
      </h2>
      {projects.length === 0 ? (
        <p className="text-sm text-zinc-500">
          You don't have any stories yet. Create a story in the Studio and come
          back here to publish it to the community.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => {
            const cover = project.pages?.[0]?.url;
            const totalPages = project.pages?.length || 0;
            const totalSessions = project.sessions?.length || 0;
            const updated = project.updatedAt || project.createdAt;
            const updatedLabel = updated
              ? new Date(updated).toLocaleDateString()
              : '';

            return (
              <div
                key={project.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden flex flex-col"
              >
                <div className="h-40 bg-zinc-800/80 flex items-center justify-center relative">
                  {cover ? (
                    <Image
                      src={cover}
                      alt={project.title || 'Manga cover'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <span className="text-xs text-zinc-500">
                      No preview image
                    </span>
                  )}
                </div>
                <div className="px-4 py-3 space-y-2 flex-1 flex flex-col">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold truncate">
                      {project.title || 'Untitled project'}
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      {totalSessions} sessions · {totalPages} pages
                    </div>
                    {updatedLabel && (
                      <div className="text-[11px] text-zinc-600">
                        Updated: {updatedLabel}
                      </div>
                    )}
                  </div>
                  {/* Tags */}
                  <div className="mt-2 space-y-1">
                    <label className="text-[10px] text-zinc-500">
                      Tags (comma separated)
                    </label>
                    <Input
                      value={(
                        projectTags[project.id] ||
                        project.tags ||
                        []
                      ).join(', ')}
                      onChange={(e) => {
                        const tags = e.target.value
                          .split(',')
                          .map((t) => t.trim())
                          .filter(Boolean);
                        setProjectTags((prev) => ({
                          ...prev,
                          [project.id]: tags,
                        }));
                      }}
                      onBlur={() => {
                        const tags =
                          projectTags[project.id] || project.tags || [];
                        if (
                          JSON.stringify(tags) !==
                          JSON.stringify(project.tags || [])
                        ) {
                          handleUpdateTags(project.id, tags);
                        }
                      }}
                      placeholder="action, romance, fantasy..."
                      className="bg-zinc-950 border-zinc-700 text-xs h-7"
                      disabled={savingProjectId === project.id}
                    />
                    {projectTags[project.id] &&
                      projectTags[project.id].length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {projectTags[project.id].slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-amber-300"
                            >
                              #{tag}
                            </span>
                          ))}
                          {projectTags[project.id].length > 3 && (
                            <span className="text-[10px] text-zinc-500">
                              +{projectTags[project.id].length - 3}
                            </span>
                          )}
                        </div>
                      )}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">
                        Public on community
                      </span>
                      <Switch
                        checked={!!project.isPublic}
                        disabled={savingProjectId === project.id}
                        onCheckedChange={(val: boolean) =>
                          handleTogglePublic(project, val)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
