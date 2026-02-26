'use client';

import { SelectItem } from '@/components/ui/select';
import {
  AspectRatio,
  DialogueDensity,
  InkingStyle,
  Language,
  MangaConfig,
  MangaStyle,
  PanelBorderStyle,
  PanelLayout,
  ReferenceImage,
  ScreentoneDensity,
} from '@/types';
import React, { useRef, useState } from 'react';
import { ConfigSelectField } from '../molecules/config-select-field';
import { ConfigSwitchField } from '../molecules/config-switch-field';
import { ReferenceImageGrid } from '../molecules/reference-image-grid';
import { StoryContextField } from '../molecules/story-context-field';
import { StudioSectionHeader } from '../molecules/studio-section-header';

interface StorySettingsPanelProps {
  context: string;
  config: MangaConfig;
  onContextChange: (context: string) => void;
  onConfigChange: (config: MangaConfig) => void;
}

export default function StorySettingsPanel({
  context,
  config,
  onContextChange,
  onConfigChange,
}: StorySettingsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const normalizeImage = (img: string | ReferenceImage): ReferenceImage => {
    if (typeof img === 'string') return { url: img, enabled: true };
    return img;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const newImages: ReferenceImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      await new Promise((resolve) => {
        reader.onload = (event) => {
          if (event.target?.result) {
            newImages.push({
              url: event.target.result as string,
              enabled: true,
            });
          }
          resolve(null);
        };
        reader.readAsDataURL(file);
      });
    }

    const currentImages = config.referenceImages || [];
    const normalizedImages = currentImages.map((img) => normalizeImage(img));
    onConfigChange({
      ...config,
      referenceImages: [...normalizedImages, ...newImages],
    });
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = async (index: number) => {
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

  const toggleImageEnabled = (index: number) => {
    const currentImages = config.referenceImages || [];
    const normalizedImages = currentImages.map((img) => normalizeImage(img));
    normalizedImages[index].enabled = !normalizedImages[index].enabled;
    onConfigChange({ ...config, referenceImages: normalizedImages });
  };

  return (
    <div className="flex-1 h-full min-h-0 flex flex-col bg-zinc-900 overflow-y-auto custom-scrollbar">
      {/* Step 1: Story Settings */}
      <div className="border-b border-zinc-800">
        <div className="p-4 pb-3 bg-zinc-950/30">
          <StudioSectionHeader
            step={1}
            label="Story Settings"
            className="mb-3"
          />

          <div className="space-y-3">
            <StoryContextField value={context} onChange={onContextChange} />

            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <ReferenceImageGrid
                images={config.referenceImages || []}
                uploading={uploading}
                onUpload={() => fileInputRef.current?.click()}
                onRemove={removeImage}
                onToggle={toggleImageEnabled}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Generation Options */}
      <div className="p-4 bg-zinc-950/30 space-y-4">
        <StudioSectionHeader
          step={2}
          label="Generation Options"
          className="mb-4"
        />

        <ConfigSelectField
          label="Art Style"
          value={config.style || ''}
          onValueChange={(v) =>
            onConfigChange({ ...config, style: v as MangaStyle })
          }
        >
          <div className="px-2 py-1 text-[9px] text-zinc-500 uppercase tracking-wider">
            Traditional Manga
          </div>
          {['Shonen', 'Shoujo', 'Seinen', 'Josei'].map((s) => (
            <SelectItem
              key={s}
              value={s}
              className="text-xs text-zinc-300 cursor-pointer"
            >
              {s}
            </SelectItem>
          ))}
          <div className="px-2 py-1 mt-2 text-[9px] text-zinc-500 uppercase tracking-wider">
            Modern Styles
          </div>
          {[
            'Manhwa 3D',
            'Modern Webtoon',
            'Korean Manhwa',
            'Digital Painting',
            'Realistic Manga',
          ].map((s) => (
            <SelectItem
              key={s}
              value={s}
              className="text-xs text-zinc-300 cursor-pointer"
            >
              {s}
            </SelectItem>
          ))}
        </ConfigSelectField>

        <div className="grid grid-cols-2 gap-3">
          <ConfigSelectField
            label="Inking/Render"
            value={config.inking || ''}
            onValueChange={(v) =>
              onConfigChange({ ...config, inking: v as InkingStyle })
            }
          >
            {['G-Pen', 'Tachikawa Pen', 'Brush Ink', 'Marker'].map((s) => (
              <SelectItem
                key={s}
                value={s}
                className="text-xs text-zinc-300 cursor-pointer"
              >
                {s}
              </SelectItem>
            ))}
          </ConfigSelectField>

          <ConfigSelectField
            label="Screentone"
            value={config.screentone || ''}
            onValueChange={(v) =>
              onConfigChange({ ...config, screentone: v as ScreentoneDensity })
            }
          >
            {Object.values(ScreentoneDensity).map((s) => (
              <SelectItem
                key={s}
                value={s}
                className="text-xs text-zinc-300 cursor-pointer"
              >
                {s}
              </SelectItem>
            ))}
          </ConfigSelectField>
        </div>

        <ConfigSelectField
          label="Panel Layout"
          value={config.layout || ''}
          onValueChange={(v) =>
            onConfigChange({ ...config, layout: v as PanelLayout })
          }
        >
          {Object.values(PanelLayout).map((l) => (
            <SelectItem
              key={l}
              value={l}
              className="text-xs text-zinc-300 cursor-pointer"
            >
              {l}
            </SelectItem>
          ))}
        </ConfigSelectField>

        <ConfigSwitchField
          label="Panel Border"
          hint={
            config.panelBorderStyle === PanelBorderStyle.FULL_BORDER
              ? 'Black borders'
              : 'Full image (no white border)'
          }
          checked={config.panelBorderStyle === PanelBorderStyle.FULL_BORDER}
          onCheckedChange={(checked) =>
            onConfigChange({
              ...config,
              panelBorderStyle: checked
                ? PanelBorderStyle.FULL_BORDER
                : PanelBorderStyle.NO_BORDER,
            })
          }
        />

        <div className="grid grid-cols-2 gap-3">
          <ConfigSelectField
            label="Dialogue"
            value={config.dialogueDensity || ''}
            onValueChange={(v) =>
              onConfigChange({
                ...config,
                dialogueDensity: v as DialogueDensity,
              })
            }
          >
            {Object.values(DialogueDensity).map((d) => (
              <SelectItem
                key={d}
                value={d}
                className="text-xs text-zinc-300 cursor-pointer"
              >
                {d}
              </SelectItem>
            ))}
          </ConfigSelectField>
          <ConfigSelectField
            label="Language"
            value={config.language || ''}
            onValueChange={(v) =>
              onConfigChange({ ...config, language: v as Language })
            }
          >
            {Object.values(Language).map((l) => (
              <SelectItem
                key={l}
                value={l}
                className="text-xs text-zinc-300 cursor-pointer"
              >
                {l}
              </SelectItem>
            ))}
          </ConfigSelectField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ConfigSelectField
            label="Aspect Ratio"
            value={config.aspectRatio || ''}
            onValueChange={(v) =>
              onConfigChange({ ...config, aspectRatio: v as AspectRatio })
            }
          >
            {Object.values(AspectRatio).map((r) => (
              <SelectItem
                key={r}
                value={r}
                className="text-xs text-zinc-300 cursor-pointer"
              >
                {r}
              </SelectItem>
            ))}
          </ConfigSelectField>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Color Mode
            </label>
            <button
              onClick={() =>
                onConfigChange({ ...config, useColor: !config.useColor })
              }
              className={`w-full h-[34px] rounded-lg transition-all flex items-center justify-center text-xs font-bold ${config.useColor ? 'bg-linear-to-r from-amber-400 via-orange-500 to-amber-600 text-black shadow-[0_2px_0_0_rgb(180,83,9)]' : 'bg-linear-to-b from-zinc-700 to-zinc-900 border border-zinc-800 text-zinc-400 shadow-[0_2px_0_0_rgb(24,24,27)]'}`}
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              {config.useColor ? 'COLOR' : 'B&W'}
            </button>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-zinc-800">
          <ConfigSwitchField
            label="Auto-Continue Story"
            hint="AI continues the story from the previous page"
            checked={!!config.autoContinueStory}
            onCheckedChange={(checked) =>
              onConfigChange({ ...config, autoContinueStory: checked })
            }
          />
          {config.autoContinueStory && (
            <textarea
              value={config.storyDirection || ''}
              onChange={(e) =>
                onConfigChange({ ...config, storyDirection: e.target.value })
              }
              placeholder="Describe the direction of the story..."
              className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 resize-y custom-scrollbar"
              style={{ fontFamily: 'var(--font-inter)', minHeight: '120px' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
