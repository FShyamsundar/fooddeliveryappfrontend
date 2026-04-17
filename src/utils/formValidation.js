export const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const validatePhone = (phone) =>
  phone.trim() === "" || /^\+?\d{7,15}$/.test(phone);
export const validateZipCode = (zip) =>
  /^[0-9A-Za-z\s-]{4,10}$/.test(zip.trim());
export const hasMinLength = (value, min) => value?.trim().length >= min;
