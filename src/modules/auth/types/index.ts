import { User } from '@user/entities/user.entity';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface CreateTokensParams {
  user: User;
  agent: string;
}

export interface CreateAccessTokenParams {
  id: number;
  email: string;
}

export interface CreateRefreshTokenParams {
  user: User;
  agent: string;
}
