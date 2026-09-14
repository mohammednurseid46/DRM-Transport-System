"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { checkUserExists, resetPassword } from "@/lib/auth";
import { Zap, Mail, Lock, AlertCircle, ArrowLeft, X, Phone, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleVerifyAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { exists } = await checkUserExists(identifier);
      if (exists) {
        setStep(2);
      } else {
        setError("No account found with this email/phone.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPassword(identifier, newPassword);
      if (response.success) {
        setSuccess(response.message);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 dark:bg-slate-900 p-4 font-sans text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white relative">
      {/* Top Navigation */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <Link href="/login" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:text-orange-500 transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm">Back to Login</span>
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 dark:bg-orange-600 shadow-lg shadow-orange-500/20">
            <Zap size={16} className="fill-current text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white hidden sm:block tracking-tight">Dream More</span>
        </Link>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-2xl relative overflow-hidden mt-12">
        {/* Close Button */}
        <Link href="/login" className="absolute top-4 right-4 text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white transition-colors z-20 bg-white/5 hover:bg-white/10 p-2 rounded-full">
          <X size={20} />
        </Link>
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-orange-500 dark:bg-orange-600/10 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-500 dark:bg-orange-600 shadow-lg shadow-orange-500/20">
            <Lock size={28} className="text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white" />
          </div>
          
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">
            {step === 1 ? "Reset Password" : "Set New Password"}
          </h1>
          <p className="mb-8 text-center text-sm text-slate-500 dark:text-slate-400">
            {step === 1 
              ? "Enter your email or phone number to reset your password." 
              : "Enter your new password below."}
          </p>

          {error && (
            <div className="mb-6 flex w-full items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              <AlertCircle size={18} className="flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 flex w-full items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400">
              <CheckCircle2 size={18} className="flex-shrink-0" />
              <p>{success}</p>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleVerifyAccount} className="w-full space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400" htmlFor="identifier">
                  Email Address or Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 dark:text-slate-500">
                    <Mail size={18} />
                  </div>
                  <input
                    id="identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-black/20 py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white placeholder-gray-500 focus:border-dms-primary focus:outline-none focus:ring-1 focus:ring-dms-primary transition-all"
                    placeholder="email@example.com or phone"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full rounded-xl bg-orange-500 dark:bg-orange-600 py-3 px-4 text-sm font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white shadow-lg shadow-orange-500/20 hover:bg-orange-500 dark:bg-orange-600-hover focus:outline-none focus:ring-2 focus:ring-dms-primary focus:ring-offset-2 focus:ring-offset-slate-50 dark:ring-offset-slate-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    "Verify Account"
                  )}
                </span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="w-full space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400" htmlFor="newPassword">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 dark:text-slate-500">
                    <Lock size={18} />
                  </div>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-black/20 py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white placeholder-gray-500 focus:border-dms-primary focus:outline-none focus:ring-1 focus:ring-dms-primary transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400" htmlFor="confirmPassword">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 dark:text-slate-500">
                    <Lock size={18} />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-black/20 py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white placeholder-gray-500 focus:border-dms-primary focus:outline-none focus:ring-1 focus:ring-dms-primary transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || success.length > 0}
                className="mt-2 w-full rounded-xl bg-orange-500 dark:bg-orange-600 py-3 px-4 text-sm font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white shadow-lg shadow-orange-500/20 hover:bg-orange-500 dark:bg-orange-600-hover focus:outline-none focus:ring-2 focus:ring-dms-primary focus:ring-offset-2 focus:ring-offset-slate-50 dark:ring-offset-slate-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </span>
              </button>
            </form>
          )}

          <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-4 w-full">
            <Link href="/login" className="text-sm text-slate-500 dark:text-slate-500 hover:text-orange-600 dark:text-orange-500 transition-colors block text-center">
              Remember your password? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
