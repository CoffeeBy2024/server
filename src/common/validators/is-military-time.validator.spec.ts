import { validate } from 'class-validator';
import { TimeDto } from './dto/time.dto'; // Adjust the import path as necessary

describe('IsMilitaryTime Validator', () => {
  it('should pass for valid military time', async () => {
    const dto = new TimeDto();
    dto.time = '14:30';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail for invalid military time', async () => {
    const dto = new TimeDto();
    dto.time = '25:00'; // Invalid hour

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isMilitaryTime).toBe(
      'time must be a valid military time format (HH:mm)'
    );
  });

  it('should fail for invalid format', async () => {
    const dto = new TimeDto();
    dto.time = '14-30'; // Invalid format

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isMilitaryTime).toBe(
      'time must be a valid military time format (HH:mm)'
    );
  });

  it('should fail for non-string input', async () => {
    const dto = new TimeDto();
    dto.time = 1430 as any; // Non-string input

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isMilitaryTime).toBe(
      'time must be a valid military time format (HH:mm)'
    );
  });

  it('should fail for missing time value', async () => {
    const dto = new TimeDto();
    dto.time = ''; // Empty string

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isNotEmpty).toBeDefined();
  });
});
