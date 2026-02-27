'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  CloudLightning,
  MessageCircle,
  MessageSquare,
  Quote,
  Upload,
} from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { DialogueBubble } from '@/types/generate';

interface DialogueBubbleWithDrag extends DialogueBubble {
  isDragging?: boolean;
}

interface DialogueCanvasProps {
  imageUrl: string;
  resultImageUrl: string;
  dialogues: DialogueBubbleWithDrag[];
  selectedDialogueId: string | null;
  imageContainerRef: React.RefObject<HTMLDivElement | null>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleImageClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleDragStart: (e: React.MouseEvent, id: string) => void;
  setSelectedDialogueId: (id: string | null) => void;
}

export const getBubbleIcon = (style: string) => {
  switch (style) {
    case 'speech':
      return <MessageCircle className="w-4 h-4" />;
    case 'thought':
      return <CloudLightning className="w-4 h-4" />;
    case 'shout':
      return <MessageSquare className="w-4 h-4" />;
    case 'whisper':
      return <Quote className="w-4 h-4" />;
    case 'narrator':
      return <BookOpen className="w-4 h-4" />;
    default:
      return <MessageCircle className="w-4 h-4" />;
  }
};

export function DialogueCanvas({
  imageUrl,
  resultImageUrl,
  dialogues,
  selectedDialogueId,
  imageContainerRef,
  handleImageUpload,
  handleImageClick,
  handleDragStart,
  setSelectedDialogueId,
}: DialogueCanvasProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Panel Preview</span>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </span>
            </Button>
          </label>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {imageUrl ? (
          <div
            ref={imageContainerRef}
            className="relative w-full aspect-3/4 bg-zinc-800 rounded-lg overflow-hidden cursor-crosshair"
            onClick={handleImageClick}
          >
            <Image
              src={resultImageUrl || imageUrl}
              alt="Manga panel"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 60vw"
            />

            {!resultImageUrl &&
              dialogues.map((bubble) => (
                <div
                  key={bubble.id}
                  className={`absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center cursor-move transition-all ${
                    selectedDialogueId === bubble.id
                      ? 'bg-amber-500 ring-2 ring-white'
                      : 'bg-blue-500 hover:bg-blue-400'
                  }`}
                  style={{
                    left: `${bubble.x}%`,
                    top: `${bubble.y}%`,
                  }}
                  onMouseDown={(e) => handleDragStart(e, bubble.id!)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDialogueId(bubble.id!);
                  }}
                >
                  {getBubbleIcon(bubble.style || 'speech')}
                </div>
              ))}

            {dialogues.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/50 px-4 py-2 rounded-lg">
                  <p className="text-sm text-zinc-300">
                    Click anywhere to add a dialogue bubble
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full aspect-3/4 bg-zinc-800 rounded-lg flex flex-col items-center justify-center">
            <Upload className="w-12 h-12 text-zinc-600 mb-4" />
            <p className="text-zinc-400 text-center mb-2">
              Upload a manga panel to start editing
            </p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button variant="secondary" asChild>
                <span>Choose File</span>
              </Button>
            </label>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
