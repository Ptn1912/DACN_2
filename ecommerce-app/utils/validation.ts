// utils/validation.ts

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email không được để trống' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Email không hợp lệ' };
  }
  
  return { isValid: true };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Mật khẩu không được để trống' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Mật khẩu phải có ít nhất 8 ký tự' };
  }
  
  // Kiểm tra có chữ và số
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return { 
      isValid: false, 
      error: 'Mật khẩu phải chứa cả chữ và số' 
    };
  }
  
  return { isValid: true };
};

// Confirm password validation
export const validateConfirmPassword = (
  password: string, 
  confirmPassword: string
): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Vui lòng xác nhận mật khẩu' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Mật khẩu xác nhận không khớp' };
  }
  
  return { isValid: true };
};

// Phone validation (VN format)
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: false, error: 'Số điện thoại không được để trống' };
  }
  
  // Remove spaces and special chars
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // VN phone: 10-11 digits, start with 0
  const phoneRegex = /^0\d{9,10}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return { 
      isValid: false, 
      error: 'Số điện thoại không hợp lệ (VD: 0901234567)' 
    };
  }
  
  return { isValid: true };
};

// Full name validation
export const validateFullName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, error: 'Họ tên không được để trống' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Họ tên quá ngắn' };
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, error: 'Họ tên quá dài' };
  }
  
  return { isValid: true };
};

// Login form validation
export const validateLoginForm = (
  email: string, 
  password: string
): { isValid: boolean; errors: { email?: string; password?: string } } => {
  const errors: { email?: string; password?: string } = {};
  
  const emailResult = validateEmail(email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error;
  }
  
  if (!password) {
    errors.password = 'Mật khẩu không được để trống';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Register form validation
export const validateRegisterForm = (formData: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}): { 
  isValid: boolean; 
  errors: { 
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
  } 
} => {
  const errors: any = {};
  
  const nameResult = validateFullName(formData.fullName);
  if (!nameResult.isValid) {
    errors.fullName = nameResult.error;
  }
  
  const emailResult = validateEmail(formData.email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error;
  }
  
  const phoneResult = validatePhone(formData.phone);
  if (!phoneResult.isValid) {
    errors.phone = phoneResult.error;
  }
  
  const passwordResult = validatePassword(formData.password);
  if (!passwordResult.isValid) {
    errors.password = passwordResult.error;
  }
  
  const confirmResult = validateConfirmPassword(
    formData.password, 
    formData.confirmPassword
  );
  if (!confirmResult.isValid) {
    errors.confirmPassword = confirmResult.error;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};