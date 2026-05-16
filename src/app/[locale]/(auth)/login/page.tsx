"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { useLoginMutation } from "@/store/api/authApi";
import { setCredentials } from "@/store/slices/authSlice";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/Button";
import {
  Sms,
  Lock,
  Eye,
  EyeSlash,
  ArrowRight2,
  Refresh2,
} from "iconsax-reactjs";
import { User } from "@/store/api/types";

export default function LoginPage() {
  const t = useTranslations();
  const locale = useLocale();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();
  // const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
  // const [facebookLogin, { isLoading: isFacebookLoading }] = useFacebookLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleAuthResponse = (result: any) => {
    console.log("Auth response:", result);
    if (result) {
      const userData = result;

      const user: User = {
        Id: userData.Id,
        FullName: userData.FullName,
        Email: userData.Email,
        Role: userData.Role,
        Token: userData.Token,
        SubscriptionType: userData.SubscriptionType,
      };

      dispatch(setCredentials({ user, token: userData.Token }));

      const maxAge = 60 * 60 * 24 * 7;
      document.cookie = `token=${userData.Token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `userRole=${userData.Role}; path=/; max-age=${maxAge}; SameSite=Lax`;

      window.location.href = `/${locale}/dashboard`;
      return true;
    } else {
      setError(result.Message || result.message);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await login({
        Email: email,
        Password: password,
      }).unwrap();
      handleAuthResponse(result);
    } catch (err: any) {
      setError(err.data?.Message || err.data?.message || t("errors.error"));
    }
  };

  const handleGoogleLogin = async () => {
    setError("");

    try {
      const accessToken = await getGoogleAccessToken();

      if (!accessToken) {
        setError(t("errors.error"));
        return;
      }

      // const result = await googleLogin({ accessToken }).unwrap();
      // handleAuthResponse(result);
    } catch (err: any) {
      setError(err.data?.Message || err.data?.message || t("errors.error"));
    }
  };

  const handleFacebookLogin = async () => {
    setError("");

    try {
      const accessToken = await getFacebookAccessToken();

      if (!accessToken) {
        setError(t("errors.error"));
        return;
      }

      // const result = await facebookLogin({ accessToken }).unwrap();
      // handleAuthResponse(result);
    } catch (err: any) {
      setError(err.data?.Message || err.data?.message || t("errors.error"));
    }
  };

  const getGoogleAccessToken = async (): Promise<string | null> => {
    console.log("Google login not implemented yet");
    return null;
  };

  const getFacebookAccessToken = async (): Promise<string | null> => {
    console.log("Facebook login not implemented yet");
    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-card border rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-4">
              <Sms className="h-6 w-6 text-primary" variant="Bold" />
            </div>
            <h1 className="text-2xl font-bold mb-2">{t("auth.login.title")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("auth.login.subtitle")}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("auth.login.email")}
              </label>
              <div className="relative">
                <Sms className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border bg-background px-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="example@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("auth.login.password")}
              </label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border bg-background px-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeSlash className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-muted-foreground">
                  {t("auth.login.rememberMe")}
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-primary hover:underline"
              >
                {t("auth.login.forgotPassword")}
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl py-2.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <Refresh2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {t("auth.login.submit")}
                  <ArrowRight2 className="h-4 w-4 rtl:rotate-180 transition-transform group-hover:scale-110" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                {t("auth.login.orContinueWith")}
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl gap-2"
              onClick={handleGoogleLogin}
              // disabled={isGoogleLoading}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t("auth.login.google")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl gap-2"
              onClick={handleFacebookLogin}
              // disabled={isFacebookLoading}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              {t("auth.login.facebook")}
            </Button>
          </div>

          {/* Register Link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("auth.login.noAccount")}{" "}
            <Link
              href="/register"
              className="text-primary font-medium hover:underline"
            >
              {t("auth.login.registerNow")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
