import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DEFAULT_MANGA_CONFIG } from '@/constants/manga-defaults';
import FullscreenModal from '@/features/studio/components/fullscreen-modal';
import { useProjectsStore } from '@/stores/projects.store';
import { useStudioUIStore } from '@/stores/studio-ui.store';
import { GeneratedManga } from '@/types';
import { generateId } from '@/utils/react-utils';
import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';

export const StudioDialogs = () => {
  const deleteSession = useProjectsStore((state) => state.deleteSession);
  const deletePage = useProjectsStore((state) => state.deletePage);
  const deletePages = useProjectsStore((state) => state.deletePages);
  const currentProject = useProjectsStore((state) => state.currentProject);
  const currentSession = useProjectsStore((state) => state.currentSession);
  const addPage = useProjectsStore((state) => state.addPage);

  const {
    deleteConfirmation,
    setDeleteConfirmation,
    fullscreenPreview,
    setStudioState,
    prompt,
  } = useStudioUIStore(
    useShallow((state) => ({
      deleteConfirmation: state.deleteConfirmation,
      setDeleteConfirmation: state.setDeleteConfirmation,
      fullscreenPreview: state.fullscreenPreview,
      setStudioState: state.setStudioState,
      prompt: state.prompt,
    })),
  );

  const handleConfirmDelete = async () => {
    const { type, id, ids } = deleteConfirmation;
    try {
      if (type === 'session' && id) {
        await deleteSession(id);
        toast.success('Session deleted');
      } else if (type === 'page' && id) {
        await deletePage(id);
        toast.success('Page deleted');
      } else if (type === 'pages' && ids && ids.length > 0) {
        await deletePages(ids);
        toast.success('Pages deleted');
      }
    } catch (error) {
      toast.error('Failed to delete');
      console.error(error);
    } finally {
      setDeleteConfirmation({
        open: false,
        type: null,
        id: undefined,
        ids: undefined,
      });
    }
  };

  const handleAddToProject = async () => {
    if (!fullscreenPreview.image) return;

    // If it's from canvas, we want to add explicitly.
    // We need to construct the page object.
    // The store should probably handle this constructing if possible, but addPage expects GeneratedManga.
    // We need prompt and config.
    // If it's from canvas, we might assume it's the `currentImage` which `useStudioGeneration` produced.
    // But here pass just the image URL?
    // We need the prompt that generated it.
    // `StudioUIStore` has `prompt` (current input). But the image might have been generated with a previous prompt.
    // `useStudioGeneration` has `currentImage`.
    // If we rely on `fullscreenPreview.image`, and we want to add it, we might lose context if we don't have it.
    // However, `MangaStudio` implementation of `addToProject` used `currentImage` and `prompt` state.
    // So using `prompt` from `StudioUIStore` is consistent with previous behavior (assuming prompt hasn't changed).

    const newPage: GeneratedManga = {
      id: generateId(),
      url: fullscreenPreview.image,
      prompt: prompt || 'Generated Image', // Fallback
      timestamp: Date.now(),
      // config: ... // We miss specific config if we don't store it with currentImage
      markedForExport: true,
      config: currentSession?.config || DEFAULT_MANGA_CONFIG, // Fallback to default
    };

    try {
      await addPage(newPage);
      toast.success('Added to project');
      setStudioState({
        fullscreenPreview: { ...fullscreenPreview, open: false }, // Close modal after adding? Or keep open?
        // MangaStudio kept it open or closed?
        // `onAddToProject` -> `addToProject` -> `setProject`.
        // It didn't close modal explicitly in `addToProject`.
      });
    } catch (error) {
      toast.error('Failed to add to project');
    }
  };

  return (
    <>
      <AlertDialog
        open={deleteConfirmation.open}
        onOpenChange={(open) => {
          if (!open)
            setDeleteConfirmation({
              open: false,
              type: null,
              id: undefined,
              ids: undefined,
            });
        }}
      >
        <AlertDialogContent className="bg-zinc-950/95 border border-zinc-800/60 backdrop-blur-md shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100 font-manga text-xl drop-shadow-[0_0_8px_rgba(251,191,36,0.2)]">
              {deleteConfirmation.type === 'session'
                ? 'Delete Session?'
                : deleteConfirmation.type === 'pages'
                  ? 'Delete Pages?'
                  : 'Delete Page?'}
            </AlertDialogTitle>
            <AlertDialogDescription
              className="text-zinc-400"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              {deleteConfirmation.type === 'session'
                ? 'This will permanently delete this session and all its pages. This action cannot be undone.'
                : deleteConfirmation.type === 'pages'
                  ? `Are you sure you want to delete ${deleteConfirmation.ids?.length || 0} pages? This action cannot be undone.`
                  : 'This will permanently delete this page. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-300 border-zinc-700/60 rounded-xl transition-all"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-linear-to-b from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white shadow-[0_4px_0_0_rgb(153,27,27)] rounded-xl transition-all hover:scale-105"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {fullscreenPreview.open && fullscreenPreview.image && (
        <FullscreenModal
          imageUrl={fullscreenPreview.image}
          isFromCanvas={fullscreenPreview.isFromCanvas}
          onClose={() =>
            setStudioState({
              fullscreenPreview: {
                ...fullscreenPreview,
                open: false,
                image: null,
              },
            })
          }
          onAddToProject={
            fullscreenPreview.isFromCanvas ? handleAddToProject : undefined
          }
        />
      )}
    </>
  );
};
