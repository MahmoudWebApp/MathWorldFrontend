'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';
import { ArrowRight2, Eye, EyeSlash, Lock, Refresh2, Sms } from 'iconsax-reactjs';

import { Link } from '@/i18n/routing';
import type { AppDispatch } from '@/store';
import { useLoginMutation } from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/Button';
import {
  getApiErrorMessage,
  persistAuthSession,
} from '@/lib/authSession';

export default function LoginPage() {
  const t = useTranslations();
  const locale = useLocale();
  const dispatch = useDispatch<AppDispatch>();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    try {
      const user = await login({
        Email: email.trim(),
        Password: password,
      }).unwrap();

      if (!user.Token) {
        setError(t('common.error'));
        return;
      }

      dispatch(setCredentials({ user, token: user.Token }));
      persistAuthSession(user);

      const destination = user.Role === 'Admin' ? 'admin' : 'dashboard';
      window.location.assign(`/${locale}/${destination}`);
    } catch (loginError) {
      setError(getApiErrorMessage(loginError, t('common.error')));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/5 to-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border bg-card p-8 shadow-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Sms className="h-6 w-6 text-primary" variant="Bold" />
            </div>
            <h1 className="mb-2 text-2xl font-bold">
              {t('auth.login.title')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('auth.login.subtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                {t('auth.login.email')}
              </label>
              <div className="relative">
                <Sms className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border bg-background px-10 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="example@email.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                {t('auth.login.password')}
              </label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border bg-background px-10 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeSlash className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gap-2 rounded-xl py-2.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <Refresh2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {t('auth.login.submit')}
                  <ArrowRight2 className="h-4 w-4 transition-transform rtl:rotate-180" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('auth.login.noAccount')}{' '}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              {t('auth.login.registerNow')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
