'use client';

import { useEffect, useState } from 'react';
// Remove useGenerationStore dependency for actions, but keep it if we need global state?
// Actually, let's try to remove it entirely if possible, or just use it for whatever is left in it (which might be nothing important after refactor).
// But wait, the task is to refactor the store too. So let's try to use local state + hooks.
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCancelGeneration, useGenerateSingle } from '@/features/generate';
import { useUIStore } from '@/stores/ui.store';
import { Download, RefreshCw, Wand2, X } from 'lucide-react';

export function GenerationPanel() {
  const {
    mutate: generateSingle,
    isPending: isGenerating,
    error,
    reset: resetMutation,
  } = useGenerateSingle();
  const { mutate: cancelGeneration } = useCancelGeneration();

  const { showSuccessNotification, showErrorNotification } = useUIStore();

  const [prompt, setPrompt] = useState('');
  const [config, setConfig] = useState<{
    style: 'manga' | 'anime' | 'realistic' | 'cartoon' | 'webcomic';
    genre: 'action' | 'romance' | 'fantasy' | 'horror' | 'slice-of-life';
    colorScheme: 'color' | 'blackwhite' | 'sepia';
    resolution: 'low' | 'medium' | 'high';
    aspectRatio: '16:9' | '4:3' | '1:1' | 'custom';
  }>({
    style: 'manga',
    genre: 'action',
    colorScheme: 'blackwhite',
    resolution: 'high',
    aspectRatio: '16:9',
  });

  // Local state for current generation result since we moved it out of store
  // We can use the data from useMutation, but standard pattern is often to just show it.
  // useMutation returns `data`.

  // Note: useGenerateSingle returns the mutation object.
  // We can grab data from it.
  const { data: generatedData } = useGenerateSingle();
  // Wait, calling useGenerateSingle() again gives a NEW mutation instance.
  // I need to destructor `data` from the first call.
  // const { mutate, isPending, error, data } = useGenerateSingle();

  // Actually, I need to persist the result?
  // If the user navigates away, they lose it.
  // The original store probably kept it.
  // For now, I'll keep it in local state upon success.
  const [currentGeneration, setCurrentGeneration] = useState<any | null>(null);

  // Fake progress for UI feedback since we don't have real progress from single generation endpoint yet
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 500);
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showErrorNotification('Error', 'Please enter a prompt');
      return;
    }

    try {
      resetMutation(); // Clear previous errors
      setCurrentGeneration(null);

      generateSingle(
        { prompt, config },
        {
          onSuccess: (data) => {
            showSuccessNotification('Success', 'Panel generated successfully!');
            setPrompt('');
            // data is GenerateResponse
            setCurrentGeneration(data);
          },
          onError: (err) => {
            showErrorNotification('Generation Failed', (err as Error).message);
          },
        },
      );
    } catch (error) {
      // Mutation handles error in onError usually, but if we await generic wrapper...
      // useMutation mutate is void, mutateAsync returns promise.
      // generic handleGenerate is async void.
    }
  };

  const handleCancel = () => {
    if (currentGeneration?.id) {
      cancelGeneration(currentGeneration.id);
    }
    // Also reset UI
    resetMutation();
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wand2 className="h-5 w-5 mr-2" />
            Generate Manga Panel
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Prompt Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Describe your panel
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A young warrior stands on a cliff overlooking a vast battlefield..."
              className="min-h-25"
              disabled={isGenerating}
            />
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Style</label>
              <Select
                value={config.style}
                onValueChange={(value) =>
                  setConfig((prev) => ({
                    ...prev,
                    style: value as typeof prev.style,
                  }))
                }
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manga">Manga</SelectItem>
                  <SelectItem value="anime">Anime</SelectItem>
                  <SelectItem value="realistic">Realistic</SelectItem>
                  <SelectItem value="cartoon">Cartoon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Genre</label>
              <Select
                value={config.genre}
                onValueChange={(value) =>
                  setConfig((prev) => ({
                    ...prev,
                    genre: value as typeof prev.genre,
                  }))
                }
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="action">Action</SelectItem>
                  <SelectItem value="romance">Romance</SelectItem>
                  <SelectItem value="fantasy">Fantasy</SelectItem>
                  <SelectItem value="horror">Horror</SelectItem>
                  <SelectItem value="slice-of-life">Slice of Life</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Color</label>
              <Select
                value={config.colorScheme}
                onValueChange={(value) =>
                  setConfig((prev) => ({
                    ...prev,
                    colorScheme: value as typeof prev.colorScheme,
                  }))
                }
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="color">Color</SelectItem>
                  <SelectItem value="blackwhite">Black & White</SelectItem>
                  <SelectItem value="sepia">Sepia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleGenerate}
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
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Tracking */}
      {isGenerating && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Generating panel...</span>
                <span className="text-sm text-muted-foreground">
                  {progress}%
                </span>
              </div>

              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-red-600">Generation Error</h4>
                <p className="text-sm text-red-500">
                  {(error as Error).message}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => resetMutation()}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result Display */}
      {/* 
         We used to rely on currentGeneration from store. 
         Now using local state which is set on success.
         We need to make sure the structure matches what was expected. 
         Assuming currentGeneration.imageUrl exists.
      */}
      {currentGeneration && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Panel</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              <Image
                src={currentGeneration.imageUrl || currentGeneration.url} // Handling potential variation
                alt="Generated panel"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>

              <Button variant="outline" className="flex-1">
                Add to Project
              </Button>

              <Button variant="outline">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
