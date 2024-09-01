export interface JWTPayload {
  id: number;
  email: string;
}

export interface GoogleUserInfo {
  sub: string; // Google user ID
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}

export interface GoogleUserValidateResponse {
  accessToken: string;
}

export type GoogleAuthUserInfo = {
  email: string;
  firstName: string;
  lastName?: string;
  emailVerified: boolean;
};
