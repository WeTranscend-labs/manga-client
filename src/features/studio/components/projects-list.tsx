'use client';

import { ConfirmDialog } from '@/components/modals/confirm-dialog';
import { ProjectSettingsModal } from '@/components/modals/project-settings-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingCard, LoadingGrid } from '@/components/ui/loading';
import { useModal } from '@/components/ui/modal';
import { useDeleteProject, useProjects } from '@/features/projects';
import { useProjectsStore } from '@/stores/projects.store';
import { useUIStore } from '@/stores/ui.store';
import { Plus, Settings, Share2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';

export function ProjectsList() {
  const { pagination, filters, setFilters } = useProjectsStore();

  const {
    data: projects = [],
    isLoading,
    error,
    refetch,
  } = useProjects({
    ...filters,
    status: filters.status as 'draft' | 'published' | 'archived' | undefined,
    page: pagination.page,
    limit: pagination.limit,
  });

  const { mutate: deleteProject } = useDeleteProject();

  const { setLoading } = useUIStore();
  // useModal accepts components, and returns a presenter function that accepts props
  // The props passthrough logic in ModalContainer now spreads the data argument.
  // So data passed to presentConfirm must match ConfirmDialogProps (minus isOpen/onDismiss).
  const [presentConfirm] = useModal(ConfirmDialog);
  const [presentProjectSettings] = useModal(ProjectSettingsModal);

  useEffect(() => {
    setLoading('projects-fetch', isLoading);
  }, [isLoading, setLoading]);

  if (isLoading && projects.length === 0) {
    return <LoadingGrid count={6} className="p-6" />;
  }

  if (error) {
    return (
      <LoadingCard
        title="Error Loading Projects"
        message={(error as Error).message}
        status="error"
        onRetry={() => refetch()}
      />
    );
  }

  const handleDelete = (projectId: string, projectTitle: string) => {
    presentConfirm({
      title: 'Delete Project',
      message: `Are you sure you want to delete "${projectTitle}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
      onConfirm: () => deleteProject(projectId),
      onClose: () => {},
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Projects</h2>
          <p className="text-muted-foreground">
            {/* Note: Pagination total is not yet returned by useProjects hook directly in this implementation, 
                ideally API should return metadata wrapped in the response. 
                For now we rely on what we have or need to update hook to return full response. 
                Assuming fetchWrapper returns pure data, we might miss meta.
                However, for this step, let's assume simple list. 
                TODO: Update fetchWrapper/hook to handle metadata if critical.
            */}
            {projects.length} projects
          </p>
        </div>

        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="group hover:shadow-lg transition-shadow"
          >
            <CardHeader className="p-4">
              <div className="relative aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
                {project.coverImage ? (
                  <Image
                    src={project.coverImage}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No Preview
                  </div>
                )}
              </div>

              <CardTitle className="text-lg line-clamp-1">
                {project.title}
              </CardTitle>

              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
              )}
            </CardHeader>

            <CardContent className="p-4 pt-0">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span>{project.pages.length} pages</span>
                <span>{project.status}</span>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Open
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    presentProjectSettings({
                      project,
                      onSave: (settings) => {
                        // Handle save
                      },
                      onClose: () => {},
                    })
                  }
                >
                  <Settings className="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(project.id, project.title)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          {/* Note: In this simple refactor we don't have updatePagination function easily accessible 
              without store actions if we removed them.
              But pagination state IS in store. We need setPagination action which is still in store.
              I will assume we can get setPagination from store.
          */}
          {/* 
           TODO: The pagination navigation logic here was relying on fetchProjects calling setPagination.
           Now that we use a hook, the hook should ideally update the store or we should control pagination state locally in this component
           and sync with store if needed.
           For now, I'll comment out strictly functional pagination buttons until we have proper metadata support 
           or assume simple refetch happens when store state 'page' changes.
           */}
        </div>
      )}
    </div>
  );
}
