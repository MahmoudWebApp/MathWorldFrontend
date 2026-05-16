'use client';

import { ReactNode, useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { ThemeProvider } from 'next-themes';
import { NextIntlClientProvider } from 'next-intl';
import { store } from '@/store';
import { AuthProvider } from './AuthProvider';
import { useLocale } from 'next-intl';
import { setLocale } from '@/store/slices/localeSlice';
import { TooltipProvider } from '@/components/ui/Tooltip';

interface ProvidersProps {
  children: ReactNode;
  locale: string;
  messages: Record<string, any>;
  timeZone: string;
}

// Inner component to sync Next.js locale with Redux store
function LocaleSync({ children }: { children: ReactNode }) {
  const locale = useLocale();

  useEffect(() => {
    store.dispatch(setLocale(locale));
  }, [locale]);

  return <>{children}</>;
}

export function Providers({ children, locale, messages, timeZone }: ProvidersProps) {
  return (
    <ReduxProvider store={store}>
      <AuthProvider>
        <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <TooltipProvider delayDuration={200} skipDelayDuration={0}>
              <LocaleSync>
                <div className="w-full">
                  {children}
                </div>
              </LocaleSync>
            </TooltipProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </AuthProvider>
    </ReduxProvider>
  );
}