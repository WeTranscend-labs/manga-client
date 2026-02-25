'use client';

import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, X } from 'lucide-react';
import { ConfigSelectField } from './config-select-field';

import { SelectItem } from '@/components/ui/select';

interface GenerationFormMoleculeProps {
  prompt: string;
  onPromptChange: (val: string) => void;
  config: any;
  onConfigChange: (val: any) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  onCancel: () => void;
}

export const GenerationFormMolecule = ({
  prompt,
  onPromptChange,
  config,
  onConfigChange,
  isGenerating,
  onGenerate,
  onCancel,
}: GenerationFormMoleculeProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">
          Describe your panel
        </label>
        <Textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="A young warrior stands on a cliff overlooking a vast battlefield..."
          className="min-h-25"
          disabled={isGenerating}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ConfigSelectField
          label="Style"
          value={config.style}
          onValueChange={(v) => onConfigChange({ ...config, style: v })}
          disabled={isGenerating}
        >
          <SelectItem value="manga">Manga</SelectItem>
          <SelectItem value="anime">Anime</SelectItem>
          <SelectItem value="realistic">Realistic</SelectItem>
          <SelectItem value="cartoon">Cartoon</SelectItem>
        </ConfigSelectField>

        <ConfigSelectField
          label="Genre"
          value={config.genre}
          onValueChange={(v) => onConfigChange({ ...config, genre: v })}
          disabled={isGenerating}
        >
          <SelectItem value="action">Action</SelectItem>
          <SelectItem value="romance">Romance</SelectItem>
          <SelectItem value="fantasy">Fantasy</SelectItem>
          <SelectItem value="horror">Horror</SelectItem>
          <SelectItem value="slice-of-life">Slice of Life</SelectItem>
        </ConfigSelectField>

        <ConfigSelectField
          label="Color"
          value={config.colorScheme}
          onValueChange={(v) => onConfigChange({ ...config, colorScheme: v })}
          disabled={isGenerating}
        >
          <SelectItem value="color">Color</SelectItem>
          <SelectItem value="blackwhite">Black & White</SelectItem>
          <SelectItem value="sepia">Sepia</SelectItem>
        </ConfigSelectField>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          onClick={onGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="flex-1"
        >
          {isGenerating ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate Panel
            </>
          )}
        </Button>

        {isGenerating && (
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};
