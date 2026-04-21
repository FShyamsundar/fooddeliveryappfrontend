export const validateEmail = (email) => {
  if (!email || email.trim() === "") return "Email is required.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address.";
  return null;
};

export const validatePhone = (phone) => {
  if (!phone || phone.trim() === "") return "Phone number is required.";
  // Remove all non-digit characters for validation
  const cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return "Phone number must be between 10-15 digits.";
  }
  // Basic phone number pattern (allows international format)
  const phoneRegex = /^[\+]?[1-9][\d]{0,14}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return "Please enter a valid phone number.";
  }
  return null;
};

export const validatePinCode = (pinCode, country = "IN") => {
  if (!pinCode || pinCode.trim() === "") return "Pin code is required.";

  // Remove spaces and hyphens for validation
  const cleanPin = pinCode.replace(/[\s-]/g, "");

  switch (country.toUpperCase()) {
    case "IN": // India
      if (!/^\d{6}$/.test(cleanPin)) {
        return "Indian pin code must be 6 digits.";
      }
      break;
    case "US": // United States
      if (!/^\d{5}(-\d{4})?$/.test(pinCode)) {
        return "US ZIP code must be 5 digits or 5+4 format.";
      }
      break;
    case "UK": // United Kingdom
      if (!/^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i.test(pinCode)) {
        return "Please enter a valid UK postcode.";
      }
      break;
    default:
      if (cleanPin.length < 4 || cleanPin.length > 10) {
        return "Pin code must be between 4-10 characters.";
      }
  }
  return null;
};

export const validateCity = (city) => {
  if (!city || city.trim() === "") return "City is required.";
  if (city.trim().length < 2) return "City name must be at least 2 characters.";
  if (city.trim().length > 50)
    return "City name must be less than 50 characters.";
  // Allow letters, spaces, hyphens, and apostrophes
  if (!/^[a-zA-Z\s\-']+$/.test(city.trim())) {
    return "City name can only contain letters, spaces, hyphens, and apostrophes.";
  }
  return null;
};

export const validateAddress = (address) => {
  if (!address || address.trim() === "") return "Address is required.";
  if (address.trim().length < 10)
    return "Address must be at least 10 characters.";
  if (address.trim().length > 200)
    return "Address must be less than 200 characters.";
  return null;
};

export const validateName = (name, fieldName = "Name") => {
  if (!name || name.trim() === "") return `${fieldName} is required.`;
  if (name.trim().length < 2)
    return `${fieldName} must be at least 2 characters.`;
  if (name.trim().length > 50)
    return `${fieldName} must be less than 50 characters.`;
  // Allow letters, spaces, hyphens, and apostrophes
  if (!/^[a-zA-Z\s\-']+$/.test(name.trim())) {
    return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes.`;
  }
  return null;
};

export const validateState = (state) => {
  if (!state || state.trim() === "") return "State/Province is required.";
  if (state.trim().length < 2)
    return "State/Province must be at least 2 characters.";
  if (state.trim().length > 50)
    return "State/Province must be less than 50 characters.";
  // Allow letters, spaces, hyphens, and apostrophes
  if (!/^[a-zA-Z\s\-']+$/.test(state.trim())) {
    return "State/Province can only contain letters, spaces, hyphens, and apostrophes.";
  }
  return null;
};

export const validateZipCode = (zip) => {
  if (!zip || zip.trim() === "") return "Zip code is required.";
  if (!/^[0-9A-Za-z\s-]{4,10}$/.test(zip.trim()))
    return "Please enter a valid zip code.";
  return null;
};

export const hasMinLength = (value, min) => value?.trim().length >= min;

export const validatePassword = (password) => {
  if (!password || password.length < 6)
    return "Password must be at least 6 characters long.";
  if (!/(?=.*[a-z])/.test(password))
    return "Password must contain at least one lowercase letter.";
  if (!/(?=.*[A-Z])/.test(password))
    return "Password must contain at least one uppercase letter.";
  if (!/(?=.*\d)/.test(password))
    return "Password must contain at least one number.";
  return null; // valid
};

export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === "") return `${fieldName} is required.`;
  return null;
};

export const validateNumeric = (value, fieldName) => {
  const num = Number(value);
  if (isNaN(num) || num <= 0)
    return `${fieldName} must be a valid positive number.`;
  return null;
};

export const validatePrice = (value) => {
  const num = parseFloat(value);
  if (isNaN(num) || num < 0) return "Price must be a valid positive number.";
  if (num > 10000) return "Price seems too high. Please check the value.";
  return null;
};

export const validateQuantity = (value) => {
  const num = parseInt(value);
  if (isNaN(num) || num < 1) return "Quantity must be at least 1.";
  if (num > 100) return "Quantity cannot exceed 100.";
  return null;
};
