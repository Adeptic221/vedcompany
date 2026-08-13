export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

/** New passwords (register / reset): at least 7 characters. */
export function isValidPassword(password: string): boolean {
  return password.length >= 7;
}

export function isValidName(name: string): boolean {
  return name.trim().length >= 2;
}