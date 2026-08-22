/** What the server hands back on sign-in. Only the fields this app actually shows are kept —
 *  the DTO carries far more, all of it about a farm this app has nothing to do with. */
export type User = {
  id: number;
  name: string;
  surname: string;
  email: string;
  isSeller: boolean;
  sellerName: string;
  sellerPhone: string;
  /** Handles, not links — how the seller wants to be reached. Empty means "not offered". */
  sellerTelegram: string;
  sellerWhatsapp: string;
  sellerFacebook: string;
  /** Free text, the way the seller writes it. */
  sellerLocation: string;
  hasManagementAccess: boolean;
};

/** Everything the profile form holds. Sent whole, so clearing a field clears it server-side. */
export type SellerProfile = {
  sellerName: string;
  name: string;
  surname: string;
  sellerPhone: string;
  sellerTelegram: string;
  sellerWhatsapp: string;
  sellerFacebook: string;
  sellerLocation: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type LoginRequest = {
  email: string;
  password: string;
};

/** Signing up here always makes a seller without access to the farm software — this app is the
 *  marketplace, and a shop that sells on it has no farm to manage. */
export type SellerAccountRequest = {
  name: string;
  email: string;
  password: string;
  sellerName: string;
  sellerPhone: string;
};
