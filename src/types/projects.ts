export interface Project {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  coverImage?: string;
  thumbnailUrl?: string;
  tags: string[];
  isPublic: boolean;
  viewCount: number;
  likeCount: number;
  settings: {
    style: 'anime' | 'realistic' | 'cartoon' | 'manga' | 'webcomic';
    genre: string;
    colorScheme: 'color' | 'blackwhite' | 'sepia';
    language: string;
    aspectRatio: '16:9' | '4:3' | '1:1' | 'custom';
    resolution: 'low' | 'medium' | 'high' | 'ultra';
  };
  pages: ProjectPage[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectPage {
  id: string;
  pageNumber: number;
  panels: Panel[];
  layout: string;
  background?: string;
}

export interface Panel {
  id: string;
  position: number;
  prompt: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  text?: string;
  style?: {
    layout: 'single' | 'double' | 'triple' | 'quad';
    size: 'small' | 'medium' | 'large' | 'full';
    border: boolean;
    background?: string;
  };
}

export interface CreateProjectData {
  title: string;
  description?: string;
  settings: Project['settings'];
  tags?: string[];
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  status?: Project['status'];
  isPublic?: boolean;
  pages?: ProjectPage[];
}

export interface ProjectListParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  filter?: string;
  status?: Project['status'];
}
