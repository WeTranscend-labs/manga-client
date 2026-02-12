export const ROUTES = {
  HOME: '/',
  LANDING: '/landing-v2',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  STUDIO: {
    ROOT: '/studio',
    CANVAS_EDITOR: '/studio/canvas-editor',
    DIALOGUE_EDITOR: '/studio/dialogue-editor',
    GENERATE_CLEAN: '/studio/generate-clean',
    PREVIEW: '/studio/preview',
  },
  PROFILE: '/profile',
  COMMUNITY: '/community',
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LANDING,
  ROUTES.AUTH.LOGIN,
  ROUTES.AUTH.REGISTER,
];
