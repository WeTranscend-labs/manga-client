'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface GeneratedPanelsGalleryProps {
  generatedImages: string[];
  goToDialogueEditor: (imageUrl: string) => void;
}

export function GeneratedPanelsGallery({
  generatedImages,
  goToDialogueEditor,
}: GeneratedPanelsGalleryProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 h-full">
      <CardHeader>
        <CardTitle>Generated Panels</CardTitle>
        <CardDescription>Click on any panel to edit dialogue</CardDescription>
      </CardHeader>
      <CardContent>
        {generatedImages.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {generatedImages.map((imageUrl, idx) => (
              <div
                key={idx}
                className="relative group cursor-pointer rounded-lg overflow-hidden border border-zinc-700 hover:border-amber-500 transition-all aspect-[3/4]"
                onClick={() => goToDialogueEditor(imageUrl)}
              >
                <Image
                  src={imageUrl}
                  alt={`Generated panel ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary" className="gap-2">
                    Add Dialogue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-xs">
                  Panel {idx + 1}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-96 flex flex-col items-center justify-center text-zinc-500">
            <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg mb-2">No panels generated yet</p>
            <p className="text-sm text-center max-w-md">
              Describe your scene and click &quot;Generate Clean Panels&quot; to
              create manga panels without dialogue bubbles.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
