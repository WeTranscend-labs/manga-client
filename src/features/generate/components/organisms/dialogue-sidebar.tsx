'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Download, Plus, Trash2, Wand2 } from 'lucide-react';

import { DialogueBubble, DialogueSuggestion } from '@/types/generate';
import { getBubbleIcon } from './dialogue-canvas';

interface DialogueBubbleWithDrag extends DialogueBubble {
  isDragging?: boolean;
}

interface DialogueSidebarProps {
  storyContext: string;
  setStoryContext: (v: string) => void;
  suggestions: DialogueSuggestion[];
  addDialogueBubble: (
    x?: number,
    y?: number,
    suggestion?: DialogueSuggestion,
  ) => void;
  dialogues: DialogueBubbleWithDrag[];
  selectedDialogueId: string | null;
  setSelectedDialogueId: (id: string | null) => void;
  deleteDialogue: (id: string) => void;
  updateDialogue: (id: string, updates: Partial<DialogueBubble>) => void;
  language: string;
  setLanguage: (v: string) => void;
  fontStyle: string;
  setFontStyle: (v: any) => void;
  resultImageUrl: string;
}

export function DialogueSidebar({
  storyContext,
  setStoryContext,
  suggestions,
  addDialogueBubble,
  dialogues,
  selectedDialogueId,
  setSelectedDialogueId,
  deleteDialogue,
  updateDialogue,
  language,
  setLanguage,
  fontStyle,
  setFontStyle,
  resultImageUrl,
}: DialogueSidebarProps) {
  const selectedDialogue = dialogues.find((d) => d.id === selectedDialogueId);

  return (
    <div className="space-y-4">
      {/* Story Context */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm">Story Context (for AI)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Describe the scene context for better AI suggestions..."
            value={storyContext}
            onChange={(e) => setStoryContext(e.target.value)}
            className="bg-zinc-800 border-zinc-700"
            rows={3}
          />
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <Wand2 className="w-4 h-4 mr-2 text-amber-400" />
              AI Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="p-3 bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-700 transition-colors"
                onClick={() =>
                  addDialogueBubble(
                    suggestion.suggestedX,
                    suggestion.suggestedY,
                    suggestion,
                  )
                }
              >
                <div className="flex items-center gap-2 mb-1">
                  {getBubbleIcon(suggestion.style)}
                  <span className="text-xs text-zinc-400">
                    {suggestion.characterName || 'Unknown'}
                  </span>
                </div>
                <p className="text-sm">&quot;{suggestion.text}&quot;</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {suggestion.reasoning}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Dialogue List */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Dialogues ({dialogues.length})</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addDialogueBubble()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-48 overflow-y-auto">
          {dialogues.map((bubble, idx) => (
            <div
              key={bubble.id}
              className={`p-2 rounded-lg cursor-pointer flex items-center justify-between ${
                selectedDialogueId === bubble.id
                  ? 'bg-amber-500/20 border border-amber-500/50'
                  : 'bg-zinc-800 hover:bg-zinc-700'
              }`}
              onClick={() => setSelectedDialogueId(bubble.id!)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {getBubbleIcon(bubble.style || 'speech')}
                <span className="text-sm truncate">
                  {bubble.text || `Bubble ${idx + 1}`}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteDialogue(bubble.id!);
                }}
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </Button>
            </div>
          ))}
          {dialogues.length === 0 && (
            <p className="text-sm text-zinc-500 text-center py-4">
              No dialogues yet. Click on the image to add.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Selected Dialogue Editor */}
      {selectedDialogue && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm">Edit Dialogue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Character Name</Label>
              <Input
                placeholder="Character name"
                value={selectedDialogue.characterName || ''}
                onChange={(e) =>
                  updateDialogue(selectedDialogue.id!, {
                    characterName: e.target.value,
                  })
                }
                className="bg-zinc-800 border-zinc-700 mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Dialogue Text</Label>
              <Textarea
                placeholder="Enter dialogue..."
                value={selectedDialogue.text}
                onChange={(e) =>
                  updateDialogue(selectedDialogue.id!, {
                    text: e.target.value,
                  })
                }
                className="bg-zinc-800 border-zinc-700 mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Style</Label>
                <Select
                  value={selectedDialogue.style || 'speech'}
                  onValueChange={(v) =>
                    updateDialogue(selectedDialogue.id!, {
                      style: v as any,
                    })
                  }
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="speech">Speech</SelectItem>
                    <SelectItem value="thought">Thought</SelectItem>
                    <SelectItem value="shout">Shout</SelectItem>
                    <SelectItem value="whisper">Whisper</SelectItem>
                    <SelectItem value="narrator">Narrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Tail Direction</Label>
                <Select
                  value={selectedDialogue.tailDirection || 'left'}
                  onValueChange={(v) =>
                    updateDialogue(selectedDialogue.id!, {
                      tailDirection: v as any,
                    })
                  }
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">X Position (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={Math.round(selectedDialogue.x)}
                  onChange={(e) =>
                    updateDialogue(selectedDialogue.id!, {
                      x: Number(e.target.value),
                    })
                  }
                  className="bg-zinc-800 border-zinc-700 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Y Position (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={Math.round(selectedDialogue.y)}
                  onChange={(e) =>
                    updateDialogue(selectedDialogue.id!, {
                      y: Number(e.target.value),
                    })
                  }
                  className="bg-zinc-800 border-zinc-700 mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Output Settings */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm">Output Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Japanese">Japanese</SelectItem>
                <SelectItem value="Vietnamese">Vietnamese</SelectItem>
                <SelectItem value="Korean">Korean</SelectItem>
                <SelectItem value="Chinese">Chinese</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Font Style</Label>
            <Select
              value={fontStyle}
              onValueChange={(v: any) => setFontStyle(v)}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manga">Manga</SelectItem>
                <SelectItem value="comic">Comic</SelectItem>
                <SelectItem value="handwritten">Handwritten</SelectItem>
                <SelectItem value="clean">Clean</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Download Result */}
      {resultImageUrl && (
        <Button className="w-full" asChild>
          <a href={resultImageUrl} download="manga-with-dialogue.png">
            <Download className="w-4 h-4 mr-2" />
            Download Result
          </a>
        </Button>
      )}
    </div>
  );
}
