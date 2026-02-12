import mitt from 'mitt';

type AuthEvents = {
  SESSION_EXPIRED: void;
  REFRESH_FAILED: void;
};

export const authEventBus = mitt<AuthEvents>();
