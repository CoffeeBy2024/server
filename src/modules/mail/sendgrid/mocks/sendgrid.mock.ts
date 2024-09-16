import { MailService } from '@sendgrid/mail';

export const mockMailData = {
  to: 'abc@gmail.com',
  subject: 'test email',
  from: 'def@gmail.com',
  html: '',
};

export const mockReturnValue = [{ statusCode: 201 }, {}];

export type MockService<T> = {
  [P in keyof T]: jest.Mock<any, any>;
};

export type mockMailServiceType = MockService<Partial<MailService>>;

export const createMockMailService = (): mockMailServiceType => ({
  send: jest.fn().mockResolvedValue(mockReturnValue),
});

export const sendgridMailServiceProvider = {
  provide: MailService,
  useValue: createMockMailService(),
};
