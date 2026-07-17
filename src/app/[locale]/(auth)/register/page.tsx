'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';
import { ArrowRight2 } from 'iconsax-reactjs';
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User as UserIcon,
} from 'lucide-react';

import { Link } from '@/i18n/routing';
import type { AppDispatch } from '@/store';
import { useRegisterMutation } from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/Button';
import {
  getApiErrorMessage,
  persistAuthSession,
} from '@/lib/authSession';

interface RegisterFormState {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const initialFormState: RegisterFormState = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function RegisterPage() {
  const t = useTranslations();
  const locale = useLocale();
  const dispatch = useDispatch<AppDispatch>();
  const [register, { isLoading }] = useRegisterMutation();

  const [formData, setFormData] =
    useState<RegisterFormState>(initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('errors.passwordMismatch'));
      return;
    }

    try {
      const user = await register({
        FullName: formData.fullName.trim(),
        Email: formData.email.trim(),
        Password: formData.password,
      }).unwrap();

      if (!user.Token) {
        setError(t('auth.register.generalError'));
        return;
      }

      dispatch(setCredentials({ user, token: user.Token }));
      persistAuthSession(user);

      const destination = user.Role === 'Admin' ? 'admin' : 'dashboard';
      window.location.assign(`/${locale}/${destination}`);
    } catch (registerError) {
      setError(
        getApiErrorMessage(registerError, t('auth.register.generalError')),
      );
    }
  }

  return (
    <div className="mt-8 flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/5 to-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border bg-card p-8 shadow-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <UserIcon className="h-6 w-6 text-primary" />
            </div>
            <h1 className="mb-2 text-2xl font-bold">
              {t('auth.register.title')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('auth.register.subtitle')}
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
                {t('auth.register.fullName')}
              </label>
              <div className="relative">
                <UserIcon className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full rounded-lg border bg-background px-10 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder={t('auth.register.fullNamePlaceholder')}
                  autoComplete="name"
                  minLength={2}
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                {t('auth.register.email')}
              </label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border bg-background px-10 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder={t('auth.register.emailPlaceholder')}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                {t('auth.register.password')}
              </label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-lg border bg-background px-10 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                {t('auth.register.confirmPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-lg border bg-background px-10 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="mt-2 w-full gap-2 rounded-xl py-2.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {t('auth.register.submit')}
                  <ArrowRight2 className="h-4 w-4 transition-transform rtl:rotate-180" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('auth.register.hasAccount')}{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              {t('auth.register.loginNow')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
