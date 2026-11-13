'use client';

import Script from 'next/script';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { useDispatch } from 'react-redux';
import { Facebook, Loader2, ShieldCheck } from 'lucide-react';

import type { AppDispatch } from '@/store';
import {
  useFacebookLoginMutation,
  useGoogleLoginMutation,
  useLinkFacebookMutation,
  useLinkGoogleMutation,
} from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { getApiErrorMessage, persistAuthSession } from '@/lib/authSession';
import type { User } from '@/store/api/types';

interface GoogleCredentialResponse {
  credential: string;
}
interface GoogleIdentityApi {
  initialize(options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
  }): void;
  renderButton(
    element: HTMLElement,
    options: {
      theme: string;
      size: string;
      width: number;
      text: string;
      shape: string;
    },
  ): void;
}
interface FacebookLoginResult {
  authResponse?: { accessToken?: string } | null;
  status?: string;
}
interface FacebookSdk {
  init(options: {
    appId: string;
    cookie: boolean;
    xfbml: boolean;
    version: string;
  }): void;
  login(
    callback: (result: FacebookLoginResult) => void,
    options: { scope: string; return_scopes: boolean },
  ): void;
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentityApi } };
    FB?: FacebookSdk;
  }
}

type Provider = 'Google' | 'Facebook';
type Mode = 'login' | 'link';

const translations = {
  ar: {
    divider: 'أو تابع باستخدام',
    facebook: 'المتابعة باستخدام فيسبوك',
    linkFacebook: 'ربط حساب فيسبوك',
    linkGoogle: 'ربط حساب Google',
    connected: 'تم ربط الحساب بنجاح',
    cancelled: 'لم تكتمل عملية تسجيل الدخول. حاول مجددًا.',
    error: 'تعذر إكمال تسجيل الدخول الاجتماعي.',
    safety: 'لا نشارك كلمة مرورك مع MathWorld.',
  },
  en: {
    divider: 'or continue with',
    facebook: 'Continue with Facebook',
    linkFacebook: 'Link Facebook account',
    linkGoogle: 'Link Google account',
    connected: 'Social account linked successfully',
    cancelled: 'The sign-in was not completed. Try again.',
    error: 'Social sign-in could not be completed.',
    safety: 'Your provider password is never shared with MathWorld.',
  },
};

const isEnabled = process.env.NEXT_PUBLIC_SOCIAL_LOGIN_ENABLED === 'true';
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID?.trim();

export function SocialAuthButtons({ mode = 'login' }: { mode?: Mode }) {
  const locale = useLocale();
  const copy = locale === 'ar' ? translations.ar : translations.en;
  const dispatch = useDispatch<AppDispatch>();
  const googleButton = useRef<HTMLDivElement>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [facebookReady, setFacebookReady] = useState(false);
  const [busy, setBusy] = useState<Provider | null>(null);
  const [linked, setLinked] = useState<Provider | null>(null);
  const [error, setError] = useState('');
  const [googleLogin] = useGoogleLoginMutation();
  const [facebookLogin] = useFacebookLoginMutation();
  const [linkGoogle] = useLinkGoogleMutation();
  const [linkFacebook] = useLinkFacebookMutation();

  const exchange = useCallback(async (provider: Provider, token: string) => {
    if (!token || busy) return;
    setBusy(provider);
    setError('');
    try {
      if (mode === 'link') {
        if (provider === 'Google') {
          await linkGoogle({ AccessToken: token }).unwrap();
        } else {
          await linkFacebook({ AccessToken: token }).unwrap();
        }
        setLinked(provider);
        return;
      }

      const user: User =
        provider === 'Google'
          ? await googleLogin({ AccessToken: token }).unwrap()
          : await facebookLogin({ AccessToken: token }).unwrap();

      if (!user.Token) throw new Error(copy.error);
      dispatch(setCredentials({ user, token: user.Token }));
      persistAuthSession(user);

      const destination =
        user.Role === 'Admin' ? 'admin'
          : user.CurrentStageId == null ? 'learning-stage' : 'dashboard';
      window.location.assign(`/${locale}/${destination}`);
    } catch (reason) {
      setError(getApiErrorMessage(reason, copy.error));
    } finally {
      setBusy(null);
    }
  }, [
    busy, mode, linkGoogle, linkFacebook, googleLogin, facebookLogin,
    copy.error, dispatch, locale,
  ]);

  const initializeGoogle = useCallback(() => {
    if (!isEnabled || !googleClientId ||
        !window.google?.accounts.id || !googleButton.current) return;

    const sdk = window.google.accounts.id;
    sdk.initialize({
      client_id: googleClientId,
      auto_select: false,
      callback: (response) => void exchange('Google', response.credential),
    });
    googleButton.current.replaceChildren();
    sdk.renderButton(googleButton.current, {
      theme: 'outline',
      size: 'large',
      width: 280,
      text: mode === 'link' ? 'continue_with' : 'continue_with',
      shape: 'pill',
    });
    setGoogleReady(true);
  }, [exchange, mode]);

  const initializeFacebook = useCallback(() => {
    if (!isEnabled || !facebookAppId || !window.FB) return;
    window.FB.init({
      appId: facebookAppId,
      cookie: false,
      xfbml: false,
      version: 'v22.0',
    });
    setFacebookReady(true);
  }, []);

  useEffect(() => {
    initializeGoogle();
    initializeFacebook();
  }, [initializeGoogle, initializeFacebook]);

  if (!isEnabled || (!googleClientId && !facebookAppId)) {
    return null;
  }

  const handleFacebook = () => {
    if (!facebookReady || !window.FB || busy) return;
    window.FB.login(
      (result) => {
        const token = result.authResponse?.accessToken;
        if (token) {
          void exchange('Facebook', token);
        } else {
          setError(copy.cancelled);
        }
      },
      { scope: 'public_profile,email', return_scopes: true },
    );
  };

  return (
    <div className="mt-6 space-y-4">
      {googleClientId && (
        <>
          <Script
            src="https://accounts.google.com/gsi/client"
            strategy="afterInteractive"
            onLoad={initializeGoogle}
          />
          <div className="flex justify-center">
            <div
              ref={googleButton}
              aria-label={mode === 'link' ? copy.linkGoogle : 'Google'}
              className={busy ? 'pointer-events-none opacity-60' : ''}
            />
          </div>
        </>
      )}

      {facebookAppId && (
        <>
          <Script
            src="https://connect.facebook.net/en_US/sdk.js"
            strategy="afterInteractive"
            onLoad={initializeFacebook}
          />
          <button
            type="button"
            disabled={!facebookReady || !!busy}
            onClick={handleFacebook}
            className="mx-auto flex min-h-11 w-full max-w-[280px] items-center justify-center gap-2 rounded-full border border-primary/20 bg-card px-4 text-sm font-semibold hover:bg-primary/5 disabled:opacity-60"
          >
            {busy === 'Facebook' ? <Loader2 className="h-4 w-4 animate-spin" /> :
              <Facebook className="h-4 w-4" />}
            {mode === 'link' ? copy.linkFacebook : copy.facebook}
          </button>
        </>
      )}

      {error && <p role="alert" className="text-center text-sm text-destructive">{error}</p>}
      {linked && (
        <p role="status" className="flex items-center justify-center gap-2 text-sm text-emerald-600">
          <ShieldCheck size={16} />{copy.connected}: {linked}
        </p>
      )}
      <p className="text-center text-xs text-muted-foreground">{copy.safety}</p>
    </div>
  );
}
