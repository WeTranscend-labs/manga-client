'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, RefreshCw } from 'lucide-react';
import Image from 'next/image';

interface GenerationResultMoleculeProps {
  result: any;
  onRefresh: () => void;
  onAddToProject: () => void;
  onDownload: () => void;
}

export const GenerationResultMolecule = ({
  result,
  onRefresh,
  onAddToProject,
  onDownload,
}: GenerationResultMoleculeProps) => {
  if (!result) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Panel</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          <Image
            src={result.imageUrl || result.url}
            alt="Generated panel"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" className="flex-1" onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>

          <Button variant="outline" className="flex-1" onClick={onAddToProject}>
            Add to Project
          </Button>

          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
