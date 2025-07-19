import { validate } from 'class-validator';

export const validateEntity = async (entity: any): Promise<string[]> => {
  const errors = await validate(entity);
  return errors.map(error => Object.values(error.constraints || {})).flat();
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone);
}; 