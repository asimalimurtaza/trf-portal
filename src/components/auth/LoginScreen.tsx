"use client";

import React, { useState } from "react";
import { useTRF } from "@/context/TRFContext";
import { useTheme } from "@/context/ThemeContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Wallet,
  Sun,
  Moon,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import { motion } from "framer-motion";

export function LoginScreen() {
  const { login, resetPassword } = useTRF();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both your email address and password.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);
    const res = await login(email.trim(), password.trim());
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(
        res.error ||
          "Invalid email or password. Please verify your credentials.",
      );
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg(
        "Please provide your corporate email address to receive password reset instructions.",
      );
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setIsResetting(true);
    const res = await resetPassword(email.trim());
    setIsResetting(false);

    if (res.success) {
      setSuccessMsg(
        `Password reset link sent to ${email.trim()}. Please check your inbox.`,
      );
      setShowForgot(false);
    } else {
      setErrorMsg(
        res.error ||
          "Failed to send password reset link. Please check the email address.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-4 relative">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground"
          title={theme === "dark" ? "Light Mode" : "Dark Mode"}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm space-y-5"
      >
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 shadow-xs mb-1">
            <Wallet className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Vicenna TRF Portal
          </h1>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Team Recreational Funds management system
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              {showForgot ? "Reset Password" : "Sign In"}
            </CardTitle>
            <CardDescription className="text-xs">
              {showForgot
                ? "Enter your account email to receive a password reset link"
                : "Enter your credentials to access the TRF portal"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3.5">
            {errorMsg && (
              <div className="p-2.5 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {!showForgot ? (
              <form onSubmit={handleEmailLogin} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email">Corporate Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgot(true);
                        setErrorMsg("");
                        setSuccessMsg("");
                      }}
                      className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2 mt-1"
                  disabled={isLoading}
                >
                  <span>
                    {isLoading ? "Verifying Credentials..." : "Sign In"}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </form>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="reset-email">Corporate Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowForgot(false);
                      setErrorMsg("");
                    }}
                  >
                    Back to Sign In
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 gap-1.5"
                    disabled={isResetting}
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    <span>{isResetting ? "Sending..." : "Send Link"}</span>
                  </Button>
                </div>
              </form>
            )}
          </CardContent>

          <CardFooter className="pt-0 flex justify-center border-t border-border py-2.5">
            <p className="text-[11px] text-muted-foreground text-center">
              Account provisioning is managed by the TRF Manager.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
