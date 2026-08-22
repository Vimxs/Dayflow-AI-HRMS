import bcrypt from "bcryptjs";

const BCRYPT_SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
}

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: "Weak" | "Fair" | "Good" | "Strong";
  requirements: PasswordRequirement[];
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const requirements: PasswordRequirement[] = [
    {
      id: "length",
      label: "At least 8 characters",
      met: password.length >= 8,
    },
    {
      id: "uppercase",
      label: "One uppercase letter (A-Z)",
      met: /[A-Z]/.test(password),
    },
    {
      id: "lowercase",
      label: "One lowercase letter (a-z)",
      met: /[a-z]/.test(password),
    },
    {
      id: "number",
      label: "One number (0-9)",
      met: /[0-9]/.test(password),
    },
    {
      id: "special",
      label: "One special character (!@#$%^&*)",
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const metCount = requirements.filter((r) => r.met).length;
  let score = 0;
  let label: PasswordStrengthResult["label"] = "Weak";

  if (metCount >= 5) {
    score = 4;
    label = "Strong";
  } else if (metCount >= 4) {
    score = 3;
    label = "Good";
  } else if (metCount >= 3) {
    score = 2;
    label = "Fair";
  } else if (metCount >= 1) {
    score = 1;
    label = "Weak";
  }

  return { score, label, requirements };
}
