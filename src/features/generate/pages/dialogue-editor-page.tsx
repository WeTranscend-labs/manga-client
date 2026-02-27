'use client';

import { Button } from '@/components/ui/button';
import {
  useAddDialogue,
  useSuggestDialogue,
} from '@/features/generate/hooks/use-generate';
import { DialogueBubble, DialogueSuggestion } from '@/types/generate';
import {
  BookOpen,
  CloudLightning,
  Loader2,
  MessageCircle,
  MessageSquare,
  Quote,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { DialogueCanvas } from '../components/organisms/dialogue-canvas';
import { DialogueSidebar } from '../components/organisms/dialogue-sidebar';

interface DialogueBubbleWithDrag extends DialogueBubble {
  isDragging?: boolean;
}

export function DialogueEditorPage(_props: any) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [dialogues, setDialogues] = useState<DialogueBubbleWithDrag[]>([]);
  const [selectedDialogueId, setSelectedDialogueId] = useState<string | null>(
    null,
  );

  const { mutate: suggestDialogue, isPending: isSuggesting } =
    useSuggestDialogue();
  const { mutate: addDialogue, isPending: isApplying } = useAddDialogue();

  const [suggestions, setSuggestions] = useState<DialogueSuggestion[]>([]);
  const [resultImageUrl, setResultImageUrl] = useState<string>('');
  const [storyContext, setStoryContext] = useState('');
  const [language, setLanguage] = useState('English');
  const [fontStyle, setFontStyle] = useState<
    'manga' | 'comic' | 'handwritten' | 'clean'
  >('manga');

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    bubbleX: number;
    bubbleY: number;
  } | null>(null);

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Add new dialogue bubble
  const addDialogueBubble = (
    x: number = 50,
    y: number = 50,
    suggestion?: DialogueSuggestion,
  ) => {
    const newBubble: DialogueBubbleWithDrag = {
      id: generateId(),
      x,
      y,
      text: suggestion?.text || '',
      style: suggestion?.style || 'speech',
      tailDirection: 'left',
      characterName: suggestion?.characterName || '',
    };
    setDialogues((prev) => [...prev, newBubble]);
    setSelectedDialogueId(newBubble.id!);
  };

  // Update dialogue bubble
  const updateDialogue = (id: string, updates: Partial<DialogueBubble>) => {
    setDialogues((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    );
  };

  // Delete dialogue bubble
  const deleteDialogue = (id: string) => {
    setDialogues((prev) => prev.filter((d) => d.id !== id));
    if (selectedDialogueId === id) {
      setSelectedDialogueId(null);
    }
  };

  // Handle image click to add bubble
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    addDialogueBubble(x, y);
  };

  // Handle bubble drag start
  const handleDragStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const bubble = dialogues.find((d) => d.id === id);
    if (!bubble || !imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      bubbleX: bubble.x,
      bubbleY: bubble.y,
    };

    setDialogues((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isDragging: true } : d)),
    );
    setSelectedDialogueId(id);
  };

  // Handle bubble drag
  const handleDrag = useCallback((e: MouseEvent) => {
    if (!dragRef.current || !imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragRef.current.startX) / rect.width) * 100;
    const deltaY = ((e.clientY - dragRef.current.startY) / rect.height) * 100;

    const newX = Math.max(0, Math.min(100, dragRef.current.bubbleX + deltaX));
    const newY = Math.max(0, Math.min(100, dragRef.current.bubbleY + deltaY));

    setDialogues((prev) =>
      prev.map((d) => (d.isDragging ? { ...d, x: newX, y: newY } : d)),
    );
  }, []);

  // Handle bubble drag end
  const handleDragEnd = useCallback(() => {
    dragRef.current = null;
    setDialogues((prev) => prev.map((d) => ({ ...d, isDragging: false })));
  }, []);

  // Set up drag listeners
  useEffect(() => {
    const hasDragging = dialogues.some((d) => d.isDragging);
    if (hasDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [dialogues, handleDrag, handleDragEnd]);

  // Get AI suggestions
  const getSuggestions = () => {
    if (!imageUrl) {
      toast.error('Please upload an image first');
      return;
    }

    suggestDialogue(
      {
        imageUrl,
        context: storyContext,
        previousDialogues: dialogues.map((d) => d.text).filter(Boolean),
        numberOfSuggestions: 5,
      },
      {
        onSuccess: (data) => {
          if (data.suggestions) {
            setSuggestions(data.suggestions);
            toast.success(
              `Generated ${data.suggestions.length} dialogue suggestions`,
            );
          }
        },
        onError: (error) => {
          toast.error('Failed to get dialogue suggestions');
          console.error(error);
        },
      },
    );
  };

  // Apply dialogue to image
  const applyDialogue = () => {
    if (!imageUrl || dialogues.length === 0) {
      toast.error('Please add at least one dialogue bubble');
      return;
    }

    addDialogue(
      {
        imageUrl,
        dialogues: dialogues.map((d) => ({
          id: d.id,
          x: d.x,
          y: d.y,
          text: d.text,
          style: d.style,
          tailDirection: d.tailDirection,
          characterName: d.characterName,
        })),
        language,
        fontStyle,
      },
      {
        onSuccess: (data) => {
          if (data.imageUrl) {
            setResultImageUrl(data.imageUrl);
            toast.success('Dialogue applied successfully!');
          }
        },
        onError: (error) => {
          toast.error('Failed to apply dialogue');
          console.error(error);
        },
      },
    );
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
        setResultImageUrl('');
        setSuggestions([]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Get bubble style icon
  const getBubbleIcon = (style: string) => {
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

  const selectedDialogue = dialogues.find((d) => d.id === selectedDialogueId);

  return (
    <div className="p-6 text-white text-base">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Dialogue Editor</h1>
            <p className="text-zinc-400 mt-1">
              Add and position dialogue bubbles on your manga panels
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={getSuggestions}
              disabled={!imageUrl || isSuggesting}
            >
              {isSuggesting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              AI Suggest
            </Button>
            <Button
              onClick={applyDialogue}
              disabled={!imageUrl || dialogues.length === 0 || isApplying}
            >
              {isApplying ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Apply Dialogue
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
          {/* Left Panel - Image and Bubble Placement */}
          <div className="md:col-span-8 w-full">
            <DialogueCanvas
              imageUrl={imageUrl}
              resultImageUrl={resultImageUrl}
              dialogues={dialogues}
              selectedDialogueId={selectedDialogueId}
              imageContainerRef={imageContainerRef}
              handleImageUpload={handleImageUpload}
              handleImageClick={handleImageClick}
              handleDragStart={handleDragStart}
              setSelectedDialogueId={setSelectedDialogueId}
            />
          </div>

          {/* Right Panel - Dialogue Controls */}
          <div className="md:col-span-4 w-full">
            <DialogueSidebar
              storyContext={storyContext}
              setStoryContext={setStoryContext}
              suggestions={suggestions}
              addDialogueBubble={addDialogueBubble}
              dialogues={dialogues}
              selectedDialogueId={selectedDialogueId}
              setSelectedDialogueId={setSelectedDialogueId}
              deleteDialogue={deleteDialogue}
              updateDialogue={updateDialogue}
              language={language}
              setLanguage={setLanguage}
              fontStyle={fontStyle}
              setFontStyle={setFontStyle}
              resultImageUrl={resultImageUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
