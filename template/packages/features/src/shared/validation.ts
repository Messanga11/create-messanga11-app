const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getEmailError(value: string): string | undefined {
  if (!EMAIL_PATTERN.test(value) || value.length > 254) {
    return "Saisissez une adresse e-mail valide.";
  }
  return undefined;
}

export function getPasswordError(value: string): string | undefined {
  if (value.length < 8 || value.length > 128) {
    return "Le mot de passe doit contenir entre 8 et 128 caractères.";
  }
  return undefined;
}

export function getDisplayNameError(value: string): string | undefined {
  const length = value.trim().length;
  if (length < 2 || length > 80) {
    return "Le nom doit contenir entre 2 et 80 caractères.";
  }
  return undefined;
}
