import { z } from 'zod';

export const signupSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(3, 'Name must be at least 3 characters')
        .max(30, 'Name must be less than 30 characters'),
      username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be less than 30 characters')
        .regex(
          /^[a-zA-Z0-9_]+$/,
          'Username can only contain letters, numbers, and underscores'
        ),
      email: z.string().email('Please provide a valid email address'),
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])(?=.{8,})/,
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        ),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }),
});

export const signinSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Password is required'),
  }),
});

export type SignupInput = z.infer<typeof signupSchema>['body'];
export type SigninInput = z.infer<typeof signinSchema>['body'];
