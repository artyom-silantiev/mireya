import { z } from 'zod';
import { zfd } from 'zod-form-data';

export function zodFormDataOrObject<T extends Record<string, any>>(object: T) {
  return zfd.formData(object).or(z.object(object));
}
