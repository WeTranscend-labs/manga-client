'use client';

import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

type SortOption =
  | 'newest'
  | 'oldest'
  | 'mostLiked'
  | 'mostViewed'
  | 'mostCommented'
  | 'trending';

interface CommunityFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  sortBy: SortOption;
  setSortBy: (val: SortOption) => void;
  allTags: string[];
  selectedTags: string[];
  handleTagToggle: (tag: string) => void;
  setSelectedTags: (tags: string[]) => void;
}

export function CommunityFilters({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  allTags,
  selectedTags,
  handleTagToggle,
  setSelectedTags,
}: CommunityFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            type="text"
            placeholder="Tìm kiếm truyện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-zinc-950 border-zinc-700 text-sm"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="mostLiked">Nhiều like nhất</option>
          <option value="mostViewed">Nhiều lượt xem nhất</option>
          <option value="mostCommented">Nhiều bình luận nhất</option>
          <option value="trending">Đang thịnh hành</option>
        </select>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-400">Tags:</span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-amber-500 text-black'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {tag}
            </button>
          ))}
          {selectedTags.length > 0 && (
            <button
              onClick={() => setSelectedTags([])}
              className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
