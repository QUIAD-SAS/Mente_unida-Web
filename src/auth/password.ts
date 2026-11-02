const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/;

export function passwordIssue(password: string, confirm: string) {
  if (!passwordPattern.test(password)) {
    return "La contraseña debe tener de 8 a 128 caracteres, con mayúscula, minúscula y número.";
  }
  if (password !== confirm) return "La confirmación de contraseña no coincide.";
  return "";
}
