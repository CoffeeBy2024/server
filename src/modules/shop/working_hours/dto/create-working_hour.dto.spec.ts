import { validate } from 'class-validator';
import { CreateWorkingHoursDto } from './create-working_hour.dto';
import { shopMock } from '../../shop/mocks/shopProvider';

describe('CreateWorkingHoursDto', () => {
  let dto: CreateWorkingHoursDto;

  beforeEach(() => {
    dto = new CreateWorkingHoursDto();
  });

  describe('Positive Test', () => {
    it('should succeed when all fields are valid', async () => {
      Object.assign(dto, {
        day_of_the_week: 3,
        open_hour: '09:00',
        close_hour: '17:00',
        shop: shopMock,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Negative Test', () => {
    it('should fail when day_of_the_week is missing', async () => {
      Object.assign(dto, {
        open_hour: '09:00',
        close_hour: '17:00',
        shop: shopMock,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail when day_of_the_week is not an integer', async () => {
      Object.assign(dto, {
        day_of_the_week: 'Monday' as any,
        open_hour: '09:00',
        close_hour: '17:00',
        shop: shopMock,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isInt).toBeDefined();
    });

    it('should fail when day_of_the_week is less than 1', async () => {
      Object.assign(dto, {
        day_of_the_week: 0,
        open_hour: '09:00',
        close_hour: '17:00',
        shop: shopMock,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.min).toBeDefined();
    });

    it('should fail when day_of_the_week is greater than 7', async () => {
      Object.assign(dto, {
        day_of_the_week: 8,
        open_hour: '09:00',
        close_hour: '17:00',
        shop: shopMock,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.max).toBeDefined();
    });

    it('should fail when open_hour is not a valid military time', async () => {
      Object.assign(dto, {
        day_of_the_week: 3,
        open_hour: '9:00',
        close_hour: '17:00',
        shop: shopMock,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isMilitaryTime).toBeDefined();
    });

    it('should fail when close_hour is not a valid military time', async () => {
      Object.assign(dto, {
        day_of_the_week: 3,
        open_hour: '09:00',
        close_hour: '5:00pm',
        shop: shopMock,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isMilitaryTime).toBeDefined();
    });
  });

  afterEach(() => {
    dto = {} as CreateWorkingHoursDto;
  });
});
