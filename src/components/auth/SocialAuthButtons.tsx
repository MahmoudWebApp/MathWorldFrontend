'use client';

import Script from 'next/script';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { useDispatch } from 'react-redux';
import { Loader2 } from 'lucide-react';
import type { AppDispatch } from '@/store';
import {
  useGetSocialLinkStatusQuery, useGoogleLoginMutation, useLinkGoogleMutation,
} from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { getApiErrorMessage, persistAuthSession } from '@/lib/authSession';

interface GoogleCredentialResponse { credential: string }
interface GoogleIdentityApi {
  initialize(options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
  }): void;
  renderButton(element: HTMLElement, options: {
    theme: string; size: string; width: number; text: string; shape: string;
  }): void;
}
declare global {
  interface Window { google?: { accounts: { id: GoogleIdentityApi } } }
}

type Mode = 'login' | 'link';
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
const configured = /^\d+-[a-z0-9_-]+\.apps\.googleusercontent\.com$/i.test(
  googleClientId ?? '',
);
const enabled = process.env.NEXT_PUBLIC_SOCIAL_LOGIN_ENABLED === 'true';

export function SocialAuthButtons({ mode = 'login' }: { mode?: Mode }) {
  const locale = useLocale();
  const ar = locale === 'ar';
  const dispatch = useDispatch<AppDispatch>();
  const googleButton = useRef<HTMLDivElement>(null);
  const sdkRendered = useRef<{ node: HTMLElement; mode: Mode } | null>(null);
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [linkedNow, setLinkedNow] = useState(false);
  const [error, setError] = useState('');
  const [googleLogin] = useGoogleLoginMutation();
  const [linkGoogle] = useLinkGoogleMutation();
  const { data: linkStatus, isLoading: checking, isError: checkError,
    refetch: recheck } = useGetSocialLinkStatusQuery(undefined, {
    skip: mode !== 'link' || !enabled || !configured,
    refetchOnMountOrArgChange: true,
  });
  const linked = mode === 'link' && (linkedNow || linkStatus?.GoogleLinked === true);

  const exchange = useCallback(async (token: string) => {
    if (!token || pending.current) return;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      if (mode === 'link') {
        await linkGoogle({ AccessToken: token }).unwrap();
        setLinkedNow(true);
      } else {
        const user = await googleLogin({ AccessToken: token }).unwrap();
        if (!user.Token) throw new Error('Missing MathWorld session');
        dispatch(setCredentials({ user, token: user.Token }));
        persistAuthSession(user);
        const target = user.Role === 'Admin' ? 'admin'
          : user.CurrentStageId == null ? 'learning-stage' : 'dashboard';
        window.location.assign(`/${locale}/${target}`);
      }
    } catch (reason) {
      setError(getApiErrorMessage(reason, ar
        ? 'تعذّر إكمال العملية عبر Google.'
        : 'Could not complete the Google sign-in.'));
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }, [ar, mode, linkGoogle, googleLogin, dispatch, locale]);

  const renderGoogle = useCallback(() => {
    if (!enabled || !configured || !googleClientId ||
        (mode === 'link' && (checking || checkError || linked)) ||
        !window.google?.accounts.id || !googleButton.current) return;
    const node = googleButton.current;
    if (sdkRendered.current?.node === node && sdkRendered.current.mode === mode) return;
    const sdk = window.google.accounts.id;
    sdk.initialize({
      client_id: googleClientId,
      auto_select: false,
      callback: (response) => void exchange(response.credential),
    });
    node.replaceChildren();
    sdk.renderButton(node, {
      theme: 'outline', size: 'large', width: 280, text: 'continue_with', shape: 'pill',
    });
    sdkRendered.current = { node, mode };
  }, [checking, checkError, linked, mode, exchange]);

  useEffect(() => { renderGoogle(); }, [renderGoogle]);

  if (!enabled || !configured) return null;
  // Once the account is linked, remove the link control entirely.
  if (linked) return null;
  if (mode === 'link' && checking) return <p role="status" className="mt-5 text-sm text-muted-foreground">
    {ar ? 'عم نتحقق من ربط حسابك…' : 'Checking your connected account…'}
  </p>;
  if (mode === 'link' && checkError) return <div role="alert" className="mt-5 space-y-2 text-sm">
    <p>{ar ? 'تعذّر التحقق من حالة ربط الحساب.' : 'Could not verify the connection.'}</p>
    <button type="button" onClick={() => void recheck()} className="font-semibold text-primary underline">
      {ar ? 'إعادة المحاولة' : 'Retry'}
    </button>
  </div>;

  return <div className="mt-6 space-y-4">
    <Script src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive" onLoad={renderGoogle} />
    <div className="flex justify-center">
      <div ref={googleButton}
        aria-label={mode === 'link' ? (ar ? 'ربط Google' : 'Connect Google') : 'Google'}
        className={busy ? 'pointer-events-none opacity-60' : ''} />
    </div>
    {busy && <p role="status" className="text-center text-sm text-muted-foreground">
      <Loader2 className="me-2 inline h-4 w-4 animate-spin" />
      {ar ? 'جارٍ التحقق…' : 'Verifying…'}
    </p>}
    {error && <p role="alert" className="text-center text-sm text-destructive">{error}</p>}
    <p className="text-center text-xs text-muted-foreground">
      {ar ? 'كلمة مرور Google لا تُخزّن في MathWorld.' : 'MathWorld never stores your Google password.'}
    </p>
  </div>;
}
