'use client';

import { Icons } from '@/components/icons';
import { IconButton } from '@/components/ui/icon-button';
import { MangaConfig, ReferenceImage } from '@/types';
import { ReferenceImageGrid } from '../molecules/reference-image-grid';

interface SidebarReferenceOrganismProps {
  config: MangaConfig;
  isOpen: boolean;
  onClose: () => void;
  onConfigChange: (config: MangaConfig) => void;
}

export const SidebarReferenceOrganism = ({
  config,
  isOpen,
  onClose,
  onConfigChange,
}: SidebarReferenceOrganismProps) => {
  if (!isOpen) return null;

  const normalizeImage = (img: string | ReferenceImage): ReferenceImage => {
    if (typeof img === 'string') return { url: img, enabled: true };
    return img;
  };

  const toggleImageEnabled = (index: number) => {
    const currentImages = config.referenceImages || [];
    const normalizedImages = currentImages.map((img) => normalizeImage(img));
    normalizedImages[index].enabled = !normalizedImages[index].enabled;
    onConfigChange({ ...config, referenceImages: normalizedImages });
  };

  const removeReferenceImage = async (index: number) => {
    const currentImages = config.referenceImages || [];
    const imageToRemove = currentImages[index];

    if (imageToRemove) {
      const imageUrl =
        typeof imageToRemove === 'string' ? imageToRemove : imageToRemove.url;
      if (
        imageUrl &&
        !imageUrl.startsWith('data:image') &&
        !imageUrl.startsWith('http')
      ) {
        try {
          const { storageService } = await import('@/services/storage.service');
          await storageService.deleteImage(imageUrl);
        } catch (error) {
          console.error('Failed to delete image from MongoDB:', error);
        }
      }
    }

    const newImages = currentImages.filter((_, i) => i !== index);
    onConfigChange({ ...config, referenceImages: newImages });
  };

  return (
    <div className="border-b border-zinc-800 bg-zinc-950 p-4 max-h-64 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-xs font-bold text-zinc-400 uppercase"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          Session Style References
        </h3>
        <IconButton onClick={onClose} size="icon-xs" title="Close">
          <Icons.X size={14} />
        </IconButton>
      </div>
      <ReferenceImageGrid
        images={config.referenceImages || []}
        uploading={false}
        onUpload={() => {}}
        onRemove={removeReferenceImage}
        onToggle={toggleImageEnabled}
      />
    </div>
  );
};
