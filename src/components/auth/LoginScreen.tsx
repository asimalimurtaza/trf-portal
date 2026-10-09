'use client';

import React, { useState } from 'react';
import { useTRF } from '@/context/TRFContext';
import { useTheme } from '@/context/ThemeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Wallet, ShieldCheck, User, Sun, Moon, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function LoginScreen() {
  const { login, members } = useTRF();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setErrorMsg('');
    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to sign in. Please verify your credentials.');
    }
  };

  const handleQuickDemoLogin = async (memberEmail: string) => {
    setErrorMsg('');
    setIsLoading(true);
    await login(memberEmail);
    setIsLoading(false);
  };

  // Preview 3 key members: Manager, and regular members
  const previewMembers = members.slice(0, 4);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-4 relative">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground"
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md space-y-6"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 shadow-xs mb-1">
            <Wallet className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">TRF Portal</h1>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Team Recreational Funds management, company audit claims, and member treat ledger
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Sign In</CardTitle>
            <CardDescription className="text-xs">
              Enter your corporate email address to access your account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

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
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Password</Label>
                  <span className="text-[11px] text-muted-foreground">Optional for demo</span>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                <span>{isLoading ? 'Signing In...' : 'Continue to Dashboard'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-medium">
                <span className="bg-card px-2 text-muted-foreground">
                  Or One-Click Demo Role
                </span>
              </div>
            </div>

            {/* Quick Demo Sign-in buttons */}
            <div className="space-y-1.5">
              {previewMembers.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleQuickDemoLogin(m.email)}
                  className="w-full flex items-center justify-between p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={m.avatarUrl} alt={m.name} />
                      <AvatarFallback className="text-[10px]">
                        {m.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-xs font-medium group-hover:text-foreground">
                        {m.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {m.department} • {m.designation}
                      </div>
                    </div>
                  </div>

                  <Badge
                    variant={m.role === 'manager' ? 'default' : 'secondary'}
                    className="text-[10px] gap-1"
                  >
                    {m.role === 'manager' ? (
                      <>
                        <ShieldCheck className="h-2.5 w-2.5" />
                        <span>Manager</span>
                      </>
                    ) : (
                      <>
                        <User className="h-2.5 w-2.5" />
                        <span>Member</span>
                      </>
                    )}
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>

          <CardFooter className="pt-0 flex justify-center border-t border-border py-3">
            <p className="text-[11px] text-muted-foreground text-center">
              New team member? Contact your TRF Manager to provision your account and joining fee.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
