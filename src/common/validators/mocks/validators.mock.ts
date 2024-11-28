import { ValidationArguments } from 'class-validator';

export const mockPasswordValue = '123123123';
export const mockCorrectConfirmPasswordValue = mockPasswordValue;
export const mockWrongConfirmPasswordValue = '12312';
export const mockValidationArguments: Partial<ValidationArguments> = {
  object: {
    password: mockCorrectConfirmPasswordValue,
  },
};
