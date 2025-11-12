'use client';

import { useState } from 'react';
import axios from 'axios';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { PasswordInput } from '@workspace/ui/components/password-input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';

// ✅ Validation schema
const formSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: 'Username must be at least 3 characters' })
      .max(30, { message: 'Username must be less than 30 characters' })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: 'Username can only contain letters, numbers, and underscores',
      }),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?=.{8,})/, {
        message:
          'Password must contain uppercase, lowercase, number, and special character',
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof formSchema>;

const Signup = () => {
  const [loading, setLoading] = useState(false);

  // ✅ Correct way to initialize useForm
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const {
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const { confirmPassword, ...userData } = values;
      console.log(process.env.NEXT_PUBLIC_API_URL);

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,
        {
          username: userData.username.trim(),
          email: userData.email.toLowerCase().trim(),
          password: userData.password,
          confirmPassword: confirmPassword,
        }
      );

      // On successful signup
      console.log('✅ Signup successful:', data);

      // Redirect to signin page with success state
      window.location.href = '/signin?signup=success';
    } catch (error: any) {
      console.error('Signup error:', error);

      // Handle specific error cases
      let errorMessage = 'An unexpected error occurred. Please try again.';
      const errorResponse = error.response?.data;

      if (errorResponse?.message) {
        errorMessage = errorResponse.message;
      } else if (
        error.message.includes('email') ||
        error.message.includes('username')
      ) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      form.setError('root', {
        type: 'manual',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='bg-muted h-screen'>
      <div className='flex h-full items-center justify-center'>
        <div className='flex flex-col items-center gap-6 lg:justify-start'>
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className='min-w-sm border-muted bg-background flex w-full max-w-sm flex-col items-center gap-y-4 rounded-md border px-6 py-8 shadow-md'
            >
              <h1 className='text-xl font-semibold text-center'>
                Create an account
              </h1>

              {/* Root-level error */}
              {errors.root && (
                <div className='text-destructive text-sm text-center'>
                  {errors.root.message}
                </div>
              )}

              {/* Username */}
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='username'
                        {...field}
                        className='text-sm'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='email@example.com'
                        {...field}
                        className='text-sm'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder='••••••••'
                        {...field}
                        className='text-sm'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder='••••••••'
                        {...field}
                        className='text-sm'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button type='submit' className='w-full mt-2' disabled={loading}>
                {loading ? 'Creating...' : 'Create Account'}
              </Button>
            </form>
          </Form>

          {/* Footer */}
          <div className='text-muted-foreground flex justify-center gap-1 text-sm'>
            <p>Already have an account?</p>
            <a
              href='/signin'
              className='text-primary font-medium hover:underline'
            >
              Sign in
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Signup;
