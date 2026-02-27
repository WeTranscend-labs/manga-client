'use client';

import { Button } from '@/components/ui/button';
import { Route } from '@/constants';
import { useGenerateClean } from '@/features/generate/hooks/use-generate';
import { Image as ImageIcon, Layout, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { GenerateCleanSettings } from '../components/organisms/generate-clean-settings';
import { GeneratedPanelsGallery } from '../components/organisms/generated-panels-gallery';

export function GenerateCleanPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [style, setStyle] = useState<
    'anime' | 'realistic' | 'manga' | 'webcomic'
  >('manga');
  const [colorScheme, setColorScheme] = useState<'color' | 'blackwhite'>(
    'color',
  );
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | '1:1'>('4:3');

  const { mutate: generateClean, isPending: isLoading } = useGenerateClean();

  const generateCleanPanels = () => {
    generateClean(
      {
        prompt: prompt || undefined,
        config: {
          style,
          inking: 'G-Pen',
          screentone: 'None',
          layout: 'Single Panel',
          aspectRatio,
          useColor: colorScheme === 'color',
          dialogueDensity: 'No Dialogue',
          language: 'English',
        },
        totalPages,
      },
      {
        onSuccess: (data) => {
          if (data.pages) {
            const images = data.pages
              .map((p: any) => p.panels?.[0]?.imageUrl || p.imageUrl || p.url)
              .filter(Boolean);

            setGeneratedImages(images);
            toast.success(`Generated ${images.length} clean panel(s)!`);
          }
        },
        onError: (error) => {
          toast.error('Failed to generate panels');
          console.error(error);
        },
      },
    );
  };

  const goToDialogueEditor = (imageUrl: string) => {
    // Store image in sessionStorage for dialogue editor
    sessionStorage.setItem('dialogueEditorImage', imageUrl);
    router.push(Route.STUDIO_DIALOGUE);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 text-white custom-scrollbar">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-amber-400" />
            Generate Clean Panels
          </h1>
          <p className="text-zinc-400 mt-2">
            Create manga panels without text/dialogue bubbles. Add dialogue
            freely in the editor.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left - Settings */}
          <div className="col-span-1 md:col-span-4 space-y-4 h-full">
            <GenerateCleanSettings
              prompt={prompt}
              setPrompt={setPrompt}
              style={style}
              setStyle={setStyle}
              colorScheme={colorScheme}
              setColorScheme={setColorScheme}
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
              totalPages={totalPages}
              setTotalPages={setTotalPages}
              generateCleanPanels={generateCleanPanels}
              isLoading={isLoading}
            />
          </div>

          {/* Right - Generated Images */}
          <div className="col-span-1 md:col-span-8 h-full">
            <GeneratedPanelsGallery
              generatedImages={generatedImages}
              goToDialogueEditor={goToDialogueEditor}
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex justify-center gap-4">
          <Link href={Route.STUDIO_DIALOGUE}>
            <Button variant="outline" className="gap-2">
              <Wand2 className="w-4 h-4" />
              Open Dialogue Editor
            </Button>
          </Link>
          <Link href={Route.STUDIO}>
            <Button variant="outline" className="gap-2">
              <Layout className="w-4 h-4" />
              Back to Studio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
