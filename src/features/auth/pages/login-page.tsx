'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Route } from '@/constants';
import { useLogin } from '@/hooks/use-auth';
import { loginSchema, type LoginFormData } from '@/validations/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ConnectWallet } from '../components/organisms/connect-wallet';

export function LoginPage(_props: any) {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { mutate: login, isPending: isLoading } = useLogin();

  const { login: privyLogin } = usePrivy();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setError(null);
    form.clearErrors();
    login(data, {
      onError: (err) => {
        const msg = err.message || 'Validation failed';
        setError(msg);
        toast.error('Đăng nhập thất bại', {
          description: msg,
        });
      },
      onSuccess: () => {
        toast.success('Đăng nhập thành công!', {
          description: 'Chào mừng bạn trở lại!',
        });
      },
    });
  };

  return (
    <div>
      {/* Logo SVG */}
      <Icons.Logo className="text-amber-400" />

      {/* Heading */}
      <h1
        className="text-3xl font-medium tracking-tight text-white md:text-4xl mt-4 text-left lg:text-4xl"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        Sign in to your account
      </h1>
      <p
        className="text-sm font-medium tracking-tight text-zinc-400 md:text-sm lg:text-base mt-4 max-w-xl text-left"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        We empower creators and artists to create, design, and manage AI-driven
        manga stories visually
      </p>

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-6 flex flex-col gap-6"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="h-full w-full rounded-2xl">
                <FormLabel
                  className="text-zinc-300 dark:text-neutral-100"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  Username
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="mt-4 border border-zinc-700/60 bg-zinc-950/60 text-white placeholder:text-zinc-500 focus-visible:ring-amber-500/50"
                    placeholder="Enter your username"
                    autoComplete="username"
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="h-full w-full rounded-2xl">
                <div className="flex items-center justify-between">
                  <FormLabel
                    className="text-zinc-300 dark:text-neutral-100"
                    style={{ fontFamily: 'var(--font-inter)' }}
                  >
                    Password
                  </FormLabel>
                  <Link
                    href={Route.FORGOT_PASSWORD}
                    className="text-xs text-amber-400 hover:text-amber-300 hover:underline"
                    style={{ fontFamily: 'var(--font-inter)' }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    className="mt-4 border border-zinc-700/60 bg-zinc-950/60 text-white placeholder:text-zinc-500 focus-visible:ring-amber-500/50"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel
                    className="text-zinc-300 dark:text-neutral-100 cursor-pointer"
                    style={{ fontFamily: 'var(--font-inter)' }}
                  >
                    Remember me
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          {error && (
            <div
              className="p-3 bg-red-900/20 border border-red-800/50 rounded-xl text-red-400 text-sm text-center backdrop-blur-sm"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="block rounded-xl px-6 py-2 text-center text-sm font-medium transition duration-150 active:scale-[0.98] sm:text-base bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {isLoading || form.formState.isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </Button>

          {/* Divider */}
          <div className="mt-2 flex items-center">
            <div className="h-px flex-1 bg-zinc-700 dark:bg-neutral-700"></div>
            <span className="px-4 text-sm text-zinc-500 dark:text-neutral-400">
              or
            </span>
            <div className="h-px flex-1 bg-zinc-700 dark:bg-neutral-700"></div>
          </div>

          {/* Wallet Connection */}
          <div className="flex flex-col gap-3">
            <ConnectWallet />
          </div>
        </form>
      </Form>

      {/* Footer Link */}
      <div className="mt-6 text-center">
        <span
          className="text-sm text-zinc-400 dark:text-neutral-400"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          Don&apos;t have an account?{' '}
        </span>
        <Link
          href={Route.REGISTER}
          className="text-amber-400 text-sm font-medium hover:underline"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
