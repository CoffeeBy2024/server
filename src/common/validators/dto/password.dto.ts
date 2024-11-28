import { ArePasswordsMatches } from '../are-passwords-matches.validator';

export class PasswordDto {
  password: string;

  @ArePasswordsMatches()
  confirmPassword: string;
}
