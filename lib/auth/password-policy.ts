export const ADMIN_PASSWORD_MIN_LENGTH = 12;

export function validateAdminPassword(password: string, confirmation: string): string | null {
  if (password.length < ADMIN_PASSWORD_MIN_LENGTH) {
    return `A senha deve ter pelo menos ${ADMIN_PASSWORD_MIN_LENGTH} caracteres.`;
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    return 'A senha deve conter letras minúsculas e maiúsculas.';
  }
  if (!/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return 'A senha deve conter número e símbolo.';
  }
  if (password !== confirmation) return 'As senhas não coincidem.';
  return null;
}
