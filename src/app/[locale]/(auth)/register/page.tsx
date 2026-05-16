"use client";

import { useState } from "react";
import { useTranslations ,useLocale} from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useRegisterMutation } from "@/store/api/authApi";
import { setCredentials } from "@/store/slices/authSlice";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/Button";
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { ArrowRight2 } from "iconsax-reactjs";
import { User } from "@/store/api/types";

// ============================================================================
// 📄 REGISTER PAGE COMPONENT
// ============================================================================
export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();
  const dispatch = useDispatch();
  const locale = useLocale();

  // RTK Query mutation hook for user registration
  const [register, { isLoading }] = useRegisterMutation();

  // Local state for form inputs
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // UI state management
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  const [error, setError] = useState(""); // Store validation or server errors
  const handleAuthSuccess = (
    userData: User,
    dispatch: ReturnType<typeof useDispatch>,
    router: ReturnType<typeof useRouter>,
  ) => {
    // Dispatch user credentials to Redux store for global state management
    dispatch(setCredentials({ user: userData, token: userData.Token }));

    // Cookie configuration: 7 days expiration
    const maxAge = 60 * 60 * 24 * 7;

    // Set authentication token cookie
    // 🔐 Security: In production, add 'Secure' attribute (HTTPS only)
    // Note: 'HttpOnly' cannot be set via JavaScript; handle this on backend if needed
    document.cookie = `token=${userData.Token}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;

    // Set user role cookie for client-side role-based access control
    document.cookie = `userRole=${userData.Role}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;

    // Redirect authenticated user to dashboard
    window.location.href = `/${locale}/dashboard`;
  };
  // Handle input changes with dynamic field name mapping
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // Client-side validation: Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError(t("errors.passwordMismatch"));
      return;
    }

    try {
      // Send registration request to backend
      // Note: API expects capitalized field names (FullName, Email, Password)
      const userData = await register({
        FullName: formData.fullName,
        Email: formData.email,
        Password: formData.password,
      }).unwrap();

      // ✅ Use shared auth handler for consistent post-authentication flow
      handleAuthSuccess(userData, dispatch, router);
    } catch (err: any) {
      // Error handling: Extract meaningful message from API response
      const serverMessage = err?.data?.message || err?.data?.Message || "";

      setError(
        serverMessage ||
          t("errors.generalError") ||
          "An unexpected error occurred",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background py-12 px-4 mt-8">
      <div className="w-full max-w-md">
        <div className="bg-card border rounded-2xl shadow-xl p-8">
          {/* 🎨 Header Section: Logo, Title, Subtitle */}
          <div className="text-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-4">
              <UserIcon className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {t("auth.register.title")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("auth.register.subtitle")}
            </p>
          </div>

          {/* ⚠️ Error Alert: Displays validation or server errors */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          {/* 📝 Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Input Field */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("auth.register.fullName")}
              </label>
              <div className="relative">
                <UserIcon className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full rounded-lg border bg-background px-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder={t("auth.register.fullNamePlaceholder")}
                  required
                />
              </div>
            </div>

            {/* Email Input Field */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("auth.register.email")}
              </label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border bg-background px-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder={t("auth.register.emailPlaceholder")}
                  required
                />
              </div>
            </div>

            {/* Password Input Field with Visibility Toggle */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("auth.register.password")}
              </label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-lg border bg-background px-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input Field */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("auth.register.confirmPassword")}
              </label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-lg border bg-background px-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit Button with Loading State */}
            <Button
              type="submit"
              className="w-full rounded-xl py-2.5 mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {t("auth.register.submit")}
                  <ArrowRight2 className="h-4 w-4 rtl:rotate-180 transition-transform group-hover:scale-110" />
                </>
              )}
            </Button>
          </form>

          {/* ➗ Divider with "Or Continue With" Text */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                {t("auth.register.orContinueWith")}
              </span>
            </div>
          </div>

          {/* 🔗 Social Registration Buttons (Placeholder) */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl gap-2"
              onClick={() => console.log("Google register (not implemented)")}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                {/* Google icon SVG paths */}
              </svg>
              {t("auth.login.google")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl gap-2"
              onClick={() => console.log("Facebook register (not implemented)")}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                {/* Facebook icon SVG paths */}
              </svg>
              {t("auth.login.facebook")}
            </Button>
          </div>

          {/* 🔗 Navigation: Link to Login Page for Existing Users */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("auth.register.hasAccount")}{" "}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              {t("auth.register.loginNow")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
