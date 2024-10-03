import { ValidationArguments } from 'class-validator';
import { PasswordsMatchingConstraint } from './passwords-matching-constraint.decorator';

const mockPasswordValue = '123123123';
const mockCorrectConfirmPasswordValue = mockPasswordValue;
const mockWrongConfirmPasswordValue = '12312';
const mockValidationArguments: Partial<ValidationArguments> = {
  object: {
    password: mockCorrectConfirmPasswordValue,
  },
};

describe('PasswordsMatchingConstraint', () => {
  let constraint: PasswordsMatchingConstraint;

  beforeEach(() => {
    constraint = new PasswordsMatchingConstraint();
  });

  describe('validate', () => {
    it('should return true for matched passwords', () => {
      const result = constraint.validate(
        mockCorrectConfirmPasswordValue,
        mockValidationArguments as ValidationArguments
      );
      expect(result).toBeTruthy();
    });
    it('should return false for non matched passwords', () => {
      const result = constraint.validate(
        mockWrongConfirmPasswordValue,
        mockValidationArguments as ValidationArguments
      );
      expect(result).toBeFalsy();
    });
  });

  describe('defaultMessage', () => {
    it("should return 'Passwords don't match' message", () => {
      const result = constraint.defaultMessage();
      expect(result).toBe("Passwords don't match");
    });
  });
});
