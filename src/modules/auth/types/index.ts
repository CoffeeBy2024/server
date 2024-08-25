import { User } from '@user/entities/user.entity';
import { Token } from '../entities/token.entity';

export interface Tokens {
  accessToken: string;
  refreshToken: Token;
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

export interface JWTPayload {
  id: number;
  email: string;
}
