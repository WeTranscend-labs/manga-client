'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { ReferenceImage } from '@/types';
import Image from 'next/image';

interface ReferenceImageGridProps {
  images: (string | ReferenceImage)[];
  uploading: boolean;
  onUpload: () => void;
  onRemove: (index: number) => void;
  onToggle: (index: number) => void;
}

export const ReferenceImageGrid = ({
  images,
  uploading,
  onUpload,
  onRemove,
  onToggle,
}: ReferenceImageGridProps) => {
  const normalizeImage = (img: string | ReferenceImage): ReferenceImage => {
    if (typeof img === 'string') return { url: img, enabled: true };
    return img;
  };

  const getImageUrl = (img: string | ReferenceImage): string => {
    return typeof img === 'string' ? img : img.url;
  };

  const isImageEnabled = (img: string | ReferenceImage): boolean => {
    return typeof img === 'string' ? true : img.enabled;
  };

  return (
    <div className="space-y-2">
      <label
        className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        <Icons.Image size={14} />
        <span>Reference Images</span>
        <span className="text-[9px] text-zinc-500 font-normal normal-case">
          (Optional: Character/Style references)
        </span>
      </label>

      <Button
        variant="ghost"
        size="sm"
        onClick={onUpload}
        disabled={uploading}
        className="w-full p-3 h-auto bg-zinc-950 border border-zinc-800 rounded-lg hover:border-amber-500 text-zinc-400 hover:text-amber-500 text-sm justify-center"
      >
        <Icons.Upload size={16} />
        {uploading ? 'Uploading...' : 'Upload Reference Images'}
      </Button>

      {images && images.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-zinc-400 mb-2">
            Click checkbox to enable/disable.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {images.map((img, idx) => {
              const imageUrl = getImageUrl(img);
              const enabled = isImageEnabled(img);
              const normalized = normalizeImage(img);
              return (
                <div key={idx} className="relative group h-20 w-full">
                  <Image
                    src={imageUrl}
                    alt={`Reference ${idx + 1}`}
                    fill
                    className={`object-cover rounded border transition-all ${
                      enabled
                        ? 'border-zinc-800 opacity-100'
                        : 'border-zinc-700 opacity-50 grayscale'
                    }`}
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  {/* Toggle checkbox */}
                  <button
                    type="button"
                    onClick={() => onToggle(idx)}
                    className={`absolute top-1 left-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      enabled
                        ? 'bg-amber-500 border-amber-500'
                        : 'bg-zinc-800 border-zinc-600'
                    }`}
                  >
                    {enabled && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                  {/* Remove button */}
                  <IconButton
                    onClick={() => onRemove(idx)}
                    size="icon-xs"
                    className="absolute -top-1 -right-1 !rounded-full bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove"
                  >
                    <Icons.X size={12} />
                  </IconButton>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
