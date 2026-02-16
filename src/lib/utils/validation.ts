import { z } from 'zod/v4';

export const registerSchema = z.object({
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres').max(30),
  email: z.email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(100),
});

export const loginSchema = z.object({
  username: z.string().min(1, 'El nombre de usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const verifyEmailSchema = z.object({
  email: z.email('Email inválido'),
  code: z.string().length(6, 'El código debe tener 6 dígitos'),
});

export const resendCodeSchema = z.object({
  email: z.email('Email inválido'),
});

export const forgotPasswordSchema = z.object({
  email: z.email('Email inválido'),
});

export const resetPasswordSchema = z.object({
  email: z.email('Email inválido'),
  code: z.string().length(6, 'El código debe tener 6 dígitos'),
  new_password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(100),
});

export const updateSettingsSchema = z.object({
  pomodoro_duration: z.number().refine(v => [0.17, 25, 30, 45, 60].includes(v), 'Duración no válida').optional(),
  break_duration: z.number().int().min(1).max(30).optional(),
  sessions_per_cycle: z.number().int().min(3).max(10).optional(),
  ambient_sound: z.boolean().optional(),
  notifications: z.boolean().optional(),
  auto_start_break: z.boolean().optional(),
  long_break_duration: z.number().int().min(4).max(60).optional(),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'La contraseña actual es requerida'),
  new_password: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres').max(100),
});
