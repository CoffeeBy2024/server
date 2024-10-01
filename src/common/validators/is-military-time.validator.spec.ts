import { validate } from 'class-validator';
import { TimeDto } from './dto/time.dto'; // Adjust the import path as necessary

describe('IsMilitaryTime Validator', () => {
  let dto: TimeDto;

  beforeEach(() => {
    dto = new TimeDto();
  });

  describe('Positive Tests', () => {
    it('should succeed for valid military time', async () => {
      Object.assign(dto, { time: '14:30' });

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });

  describe('Negative Tests', () => {
    it('should fail for invalid military time', async () => {
      Object.assign(dto, { time: '25:00' });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isMilitaryTime).toBe(
        'time must be a valid military time format (HH:mm)'
      );
    });

    it('should fail for invalid format', async () => {
      Object.assign(dto, { time: '14-30' });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isMilitaryTime).toBe(
        'time must be a valid military time format (HH:mm)'
      );
    });

    it('should fail for non-string input', async () => {
      Object.assign(dto, { time: 1430 as any });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isMilitaryTime).toBe(
        'time must be a valid military time format (HH:mm)'
      );
    });

    it('should fail for missing time value', async () => {
      Object.assign(dto, { time: '' });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });
  });

  afterEach(() => {
    dto = {} as TimeDto;
  });
});
