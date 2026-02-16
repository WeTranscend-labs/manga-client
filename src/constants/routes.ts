export enum Route {
  HOME = '/',
  LANDING = '/landing-v2',
  LOGIN = '/auth/login',
  REGISTER = '/auth/register',
  FORGOT_PASSWORD = '/auth/forgot-password',
  STUDIO = '/studio',
  STUDIO_CANVAS = '/studio/canvas-editor',
  STUDIO_DIALOGUE = '/studio/dialogue-editor',
  STUDIO_GENERATE = '/studio/generate-clean',
  STUDIO_PREVIEW = '/studio/preview',
  PROFILE = '/profile',
  COMMUNITY = '/community',
}

export const PUBLIC_ROUTES = [
  Route.HOME,
  Route.LANDING,
  Route.LOGIN,
  Route.REGISTER,
];
