'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { PasswordInput } from '@workspace/ui/components/password-input';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

// ✅ Validation schema
const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof formSchema>;

const Signin = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const { email, password } = values;
      await login(email, password);

      console.log('✅ Signin successful');

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Signin error:', error);

      // Handle specific error cases
      let errorMessage = 'An unexpected error occurred. Please try again.';
      const errorResponse = error.response?.data;

      if (errorResponse?.message) {
        errorMessage = errorResponse.message;
      } else if (error.message) {
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
          {/* ✅ Signin Card (same layout as Login1 but no logo) */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='min-w-sm border-muted bg-background flex w-full max-w-sm flex-col items-center gap-y-4 rounded-md border px-6 py-8 shadow-md'
            >
              <h1 className='text-xl font-semibold text-center'>Welcome back</h1>

              {/* Root-level error */}
              {form.formState.errors.root && (
                <div className='text-destructive text-sm text-center'>
                  {form.formState.errors.root.message}
                </div>
              )}

              {/* Email Field */}
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

              {/* Password Field */}
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <div className='flex items-center justify-between'>
                      <FormLabel>Password</FormLabel>
                      <a
                        href='/forgot-password'
                        className='text-primary text-sm font-medium hover:underline'
                      >
                        Forgot password?
                      </a>
                    </div>
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
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </Form>

          {/* Footer text */}
          <div className='text-muted-foreground flex justify-center gap-1 text-sm'>
            <p>Need an account?</p>
            <a
              href='/signup'
              className='text-primary font-medium hover:underline'
            >
              Sign up
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Signin;
