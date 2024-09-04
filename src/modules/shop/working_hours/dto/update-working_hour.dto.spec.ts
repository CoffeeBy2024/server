import { validate } from 'class-validator';
import { UpdateWorkingHoursDto } from './update-working_hour.dto';
import { shopMock } from '../../shop/mocks/shopProvider';

describe('UpdateWorkingHoursDto', () => {
  let dto: UpdateWorkingHoursDto;

  beforeEach(() => {
    dto = new UpdateWorkingHoursDto();
  });

  describe('Positive Tests', () => {
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

    it('should succeed when only day_of_the_week is provided and valid', async () => {
      Object.assign(dto, {
        day_of_the_week: 2,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should succeed when only open_hour is provided and valid', async () => {
      Object.assign(dto, {
        open_hour: '08:00',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should succeed when only close_hour is provided and valid', async () => {
      Object.assign(dto, {
        close_hour: '18:00',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Negative Tests', () => {
    it('should fail when day_of_the_week is provided but not an integer', async () => {
      Object.assign(dto, { day_of_the_week: 'Monday' as any });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isInt).toBeDefined();
    });

    it('should fail when day_of_the_week is less than 1', async () => {
      Object.assign(dto, { day_of_the_week: 0 });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.min).toBeDefined();
    });

    it('should fail when open_hour is provided but not a valid military time', async () => {
      Object.assign(dto, { open_hour: '9:00' });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isMilitaryTime).toBeDefined();
    });

    it('should fail when close_hour is provided but not a valid military time', async () => {
      Object.assign(dto, { close_hour: '5:00pm' });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isMilitaryTime).toBeDefined();
    });
  });

  afterEach(() => {
    dto = {} as UpdateWorkingHoursDto;
  });
});
