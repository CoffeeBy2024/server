export type JWTPayload = {
  sub: number;
  iat: number;
  exp: number;
};

export type GoogleUserInfo = {
  sub: string; // Google user ID
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
};

export type GoogleUserValidateResponse = {
  accessToken: string;
};

export type GoogleAuthUserInfo = {
  email: string;
  firstName: string;
  lastName?: string;
  emailVerified: boolean;
};
