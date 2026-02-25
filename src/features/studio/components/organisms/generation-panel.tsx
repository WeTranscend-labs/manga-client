'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCancelGeneration, useGenerateSingle } from '@/features/generate';
import { useUIStore } from '@/stores/ui.store';
import { Wand2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GenerationFormMolecule } from '../molecules/generation-form-molecule';
import { GenerationProgressMolecule } from '../molecules/generation-progress-molecule';
import { GenerationResultMolecule } from '../molecules/generation-result-molecule';

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
  const [config, setConfig] = useState({
    style: 'manga',
    genre: 'action',
    colorScheme: 'blackwhite',
    resolution: 'high',
    aspectRatio: '16:9',
  });

  const [currentGeneration, setCurrentGeneration] = useState<any | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? prev : prev + 10));
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

    resetMutation();
    setCurrentGeneration(null);

    generateSingle(
      {
        prompt,
        config: {
          style: config.style as any,
          inking: 'G-Pen',
          screentone: 'None',
          layout: 'Single Panel',
          aspectRatio:
            config.aspectRatio === 'custom' ? '4:3' : config.aspectRatio,
          useColor: config.colorScheme === 'color',
          dialogueDensity: 'Medium Dialogue',
          language: 'English',
        },
      },
      {
        onSuccess: (data) => {
          showSuccessNotification('Success', 'Panel generated successfully!');
          setPrompt('');
          setCurrentGeneration(data);
        },
        onError: (err) => {
          showErrorNotification('Generation Failed', (err as Error).message);
        },
      },
    );
  };

  const handleCancel = () => {
    if (currentGeneration?.id) cancelGeneration(currentGeneration.id);
    resetMutation();
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wand2 className="h-5 w-5 mr-2" />
            Generate Manga Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GenerationFormMolecule
            prompt={prompt}
            onPromptChange={setPrompt}
            config={config}
            onConfigChange={setConfig}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>

      {isGenerating && <GenerationProgressMolecule progress={progress} />}

      {error && (
        <Card className="border-red-200 bg-red-50/10">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <h4 className="font-medium text-red-600">Generation Error</h4>
              <p className="text-sm text-red-500">{(error as Error).message}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => resetMutation()}>
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      <GenerationResultMolecule
        result={currentGeneration}
        onRefresh={handleGenerate}
        onAddToProject={() => {}}
        onDownload={() => {}}
      />
    </div>
  );
}
