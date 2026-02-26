export enum ApiEndpoints {
  // Authentication
  AUTH_LOGIN = '/api/auth/login',
  AUTH_REGISTER = '/api/auth/register',
  AUTH_IDENTITY_LOGIN = '/api/auth/identity-login',
  AUTH_REFRESH = '/api/auth/refresh',
  AUTH_LOGOUT = '/api/auth/logout',
  AUTH_PROFILE = '/api/auth/profile',

  // Projects
  PROJECTS_LIST = '/api/projects',
  PROJECTS_CREATE = '/api/projects',
  PROJECTS_GET = '/api/projects/{{id}}',
  PROJECTS_UPDATE = '/api/projects/{{id}}',
  PROJECTS_DELETE = '/api/projects/{{id}}',
  PROJECTS_DUPLICATE = '/api/projects/{{id}}/duplicate',
  PROJECTS_FEATURED = '/api/projects/featured',
  PROJECTS_PUBLIC = '/api/projects/public',
  PROJECTS_UPDATE_META = '/api/projects/meta',
  PROJECTS_MY = '/api/projects/my',
  PROJECTS_PUBLIC_DETAIL = '/api/projects/public/{{ownerId}}/{{projectId}}',
  PROJECTS_IMAGES = '/api/projects/images',

  // Project Pages & Panels
  PROJECT_PAGE_UPDATE = '/api/projects/{{projectId}}/pages/{{pageId}}',
  PROJECT_PANEL_CREATE = '/api/projects/{{projectId}}/pages/{{pageId}}/panels',
  PROJECT_PANEL_UPDATE = '/api/projects/{{projectId}}/pages/{{pageId}}/panels/{{panelId}}',
  PROJECT_PANEL_DELETE = '/api/projects/{{projectId}}/pages/{{pageId}}/panels/{{panelId}}',

  // Sessions
  PROJECT_SESSIONS = '/api/projects/sessions',
  PROJECT_SESSIONS_PAGE = '/api/projects/sessions/page',
  PROJECT_SESSIONS_PAGE_MARK = '/api/projects/sessions/page/mark',
  PROJECT_SESSIONS_SAVE = '/api/projects/sessions/save',

  // Generation
  GENERATE_SINGLE = '/api/generate/single',
  GENERATE_BATCH = '/api/generate/batch',
  GENERATE_CLEAN = '/api/generate/clean',
  GENERATE_ADD_DIALOGUE = '/api/generate/add-dialogue',
  GENERATE_SUGGEST_DIALOGUE = '/api/generate/suggest-dialogue',
  GENERATE_STATUS = '/api/generate/status/{{id}}',
  GENERATE_CANCEL = '/api/generate/cancel/{{id}}',
  GENERATE_HISTORY = '/api/generate/history',

  // Images
  IMAGES_UPLOAD = '/api/images/upload',
  IMAGES_DELETE = '/api/images',
  IMAGES_OPTIMIZE = '/api/images/{{id}}/optimize',

  // Users
  USERS_PROFILE = '/api/users/profile',
  USERS_UPDATE_PROFILE = '/api/users/profile',
  USERS_SETTINGS = '/api/users/settings',
  USERS_USAGE = '/api/users/usage',

  // Community (Nested under Projects Public)
  COMMUNITY_TRENDING = '/api/projects/public/trending',
  COMMUNITY_LIKES = '/api/projects/public/{{ownerId}}/{{projectId}}/likes',
  COMMUNITY_COMMENTS = '/api/projects/public/{{ownerId}}/{{projectId}}/comments',
  COMMUNITY_RELATED = '/api/projects/public/{{ownerId}}/{{projectId}}/related',
  COMMUNITY_COMMENT_ADD = '/api/projects/public/{{ownerId}}/{{projectId}}/comments',
  COMMUNITY_LIKE_TOGGLE = '/api/projects/public/{{ownerId}}/{{projectId}}/likes',

  // Grok
  GROK_GENERATE = '/api/grok/generate',
  GROK_HISTORY = '/api/grok/history',

  // Billing
  BILLING_TOP_UP = '/api/billing/top-up',
  BILLING_TOP_UP_SUBMIT = '/api/billing/top-up/submit',
  BILLING_TOP_UP_STATUS = '/api/billing/top-up/status',
}

export const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
