/**
 * Only the parts of the server's auth contract this app actually reads. The web SPA's `User` is
 * much wider (plan caps, storage quota, coins); none of that means anything to a product grid,
 * so it is left out rather than copied and allowed to rot.
 */
export type User = {
  id: number;
  name: string;
  surname: string;
  email: string;
  imagePath: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type LoginRequest = {
  email: string;
  password: string;
};
