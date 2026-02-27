'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Layout, Loader2, Palette, Sparkles, Wand2 } from 'lucide-react';

interface GenerateCleanSettingsProps {
  prompt: string;
  setPrompt: (value: string) => void;
  style: 'anime' | 'realistic' | 'manga' | 'webcomic';
  setStyle: (value: any) => void;
  colorScheme: 'color' | 'blackwhite';
  setColorScheme: (value: any) => void;
  aspectRatio: '16:9' | '4:3' | '1:1';
  setAspectRatio: (value: any) => void;
  totalPages: number;
  setTotalPages: (value: number) => void;
  generateCleanPanels: () => void;
  isLoading: boolean;
}

export function GenerateCleanSettings({
  prompt,
  setPrompt,
  style,
  setStyle,
  colorScheme,
  setColorScheme,
  aspectRatio,
  setAspectRatio,
  totalPages,
  setTotalPages,
  generateCleanPanels,
  isLoading,
}: GenerateCleanSettingsProps) {
  return (
    <div className="space-y-4">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-amber-400" />
            Scene Description
          </CardTitle>
          <CardDescription>
            Describe the scene (no dialogue needed)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="A warrior standing on a cliff overlooking the ocean at sunset, dramatic lighting, wind blowing through their hair..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="bg-zinc-800 border-zinc-700 min-h-32"
            rows={5}
          />
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-400" />
            Style Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block">Art Style</Label>
            <Select value={style} onValueChange={(v: any) => setStyle(v)}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manga">Manga</SelectItem>
                <SelectItem value="anime">Anime</SelectItem>
                <SelectItem value="realistic">Realistic</SelectItem>
                <SelectItem value="webcomic">Webcomic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Color Scheme</Label>
            <Select
              value={colorScheme}
              onValueChange={(v: any) => setColorScheme(v)}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="color">Full Color</SelectItem>
                <SelectItem value="blackwhite">Black & White</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Aspect Ratio</Label>
            <Select
              value={aspectRatio}
              onValueChange={(v: any) => setAspectRatio(v)}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4:3">4:3 (Portrait)</SelectItem>
                <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                <SelectItem value="1:1">1:1 (Square)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-green-400" />
            Generation Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block">
              Number of Panels: {totalPages}
            </Label>
            <Slider
              value={[totalPages]}
              onValueChange={(v: number[]) => setTotalPages(v[0])}
              min={1}
              max={5}
              step={1}
              className="mt-2"
            />
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={generateCleanPanels}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Clean Panels
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-amber-500/10 border-amber-500/20">
        <CardContent className="pt-4">
          <p className="text-sm text-amber-200">
            💡 <strong>Tip:</strong> Clean panels have no text or dialogue
            bubbles. After generating, click on any panel to open the Dialogue
            Editor where you can add speech bubbles anywhere you want!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
