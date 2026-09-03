"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/auth";
import { Zap, Mail, Lock, User, AlertCircle, CheckCircle2, ArrowLeft, X, Circle, Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Validation Logic
  const isEmailValid = email.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNum = /\d/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);
  const isPasswordValid = hasMinLen && hasUpper && hasLower && hasNum && hasSpecial;
  const passwordsMatch = confirmPassword.length > 0 && confirmPassword === password;
  const isFormValid = name.length > 0 && email.length > 0 && isEmailValid && isPasswordValid && passwordsMatch;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailError("");
    setSuccess("");

    if (!isEmailValid || email.length === 0) {
      setEmailError("Please enter a valid email address");
      return;
    }
    if (!isPasswordValid) {
      setError("Please ensure your password meets all requirements.");
      return;
    }

    setIsLoading(true);

    // Default to "user" role for new signups
    const response = await registerUser({ name, email, password, role: "user" });

    if (response.success) {
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } else {
      setError(response.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 dark:bg-slate-900 p-4 font-sans text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white relative">
      {/* Top Navigation */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <Link href="/" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:text-orange-500 transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm">Back to Home</span>
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
        <Link href="/" className="absolute top-4 right-4 text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white transition-colors z-20 bg-white/5 hover:bg-white/10 p-2 rounded-full">
          <X size={20} />
        </Link>
        {/* Decorative elements */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-orange-500 dark:bg-orange-600/10 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-500 dark:bg-orange-600 shadow-lg shadow-orange-500/20">
            <Zap size={28} className="fill-current text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white" />
          </div>
          
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">Create Account</h1>
          <p className="mb-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Join Dream More TMS to book your rides easily.
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

          <form onSubmit={handleRegister} className="w-full space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400" htmlFor="name">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 dark:text-slate-500">
                  <User size={18} />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-black/20 py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white placeholder-gray-500 focus:border-dms-primary focus:outline-none focus:ring-1 focus:ring-dms-primary transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 dark:text-slate-500">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  className={`w-full rounded-xl border ${emailError || (email.length > 0 && !isEmailValid) ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-black/20 py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white placeholder-gray-500 focus:border-dms-primary focus:outline-none focus:ring-1 focus:ring-dms-primary transition-all`}
                  placeholder="john@example.com"
                />
              </div>
              {(emailError || (email.length > 0 && !isEmailValid)) && (
                <p className="text-xs text-red-500 mt-1">{emailError || "Invalid email format"}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 dark:text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-xl border ${password.length > 0 && !isPasswordValid ? 'border-orange-400' : 'border-slate-200 dark:border-slate-700'} bg-black/20 py-3 pl-10 pr-10 text-sm text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white placeholder-gray-500 focus:border-dms-primary focus:outline-none focus:ring-1 focus:ring-dms-primary transition-all`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Password requirements:</p>
                  <ul className="text-xs space-y-1">
                    <li className={`flex items-center gap-1 ${hasMinLen ? 'text-green-500' : 'text-slate-500'}`}>
                      <Circle size={10} className={hasMinLen ? "fill-current" : ""} /> Minimum 8 characters
                    </li>
                    <li className={`flex items-center gap-1 ${hasUpper ? 'text-green-500' : 'text-slate-500'}`}>
                      <Circle size={10} className={hasUpper ? "fill-current" : ""} /> At least 1 uppercase letter
                    </li>
                    <li className={`flex items-center gap-1 ${hasLower ? 'text-green-500' : 'text-slate-500'}`}>
                      <Circle size={10} className={hasLower ? "fill-current" : ""} /> At least 1 lowercase letter
                    </li>
                    <li className={`flex items-center gap-1 ${hasNum ? 'text-green-500' : 'text-slate-500'}`}>
                      <Circle size={10} className={hasNum ? "fill-current" : ""} /> At least 1 number
                    </li>
                    <li className={`flex items-center gap-1 ${hasSpecial ? 'text-green-500' : 'text-slate-500'}`}>
                      <Circle size={10} className={hasSpecial ? "fill-current" : ""} /> At least 1 special character (@$!%*?&)
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 dark:text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full rounded-xl border ${confirmPassword.length > 0 && !passwordsMatch ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-black/20 py-3 pl-10 pr-10 text-sm text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white placeholder-gray-500 focus:border-dms-primary focus:outline-none focus:ring-1 focus:ring-dms-primary transition-all`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !!success || !isFormValid}
              className="mt-2 w-full rounded-xl bg-orange-500 dark:bg-orange-600 py-3 px-4 text-sm font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white shadow-lg shadow-orange-500/20 hover:bg-orange-500 dark:bg-orange-600-hover focus:outline-none focus:ring-2 focus:ring-dms-primary focus:ring-offset-2 focus:ring-offset-slate-50 dark:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center">
                {isLoading && !success ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </span>
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white hover:text-orange-600 dark:text-orange-500 transition-colors">
              Sign in
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-500">
            Looking to become a driver?{" "}
            <Link href="/driver-register" className="font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white transition-colors">
              Register here
            </Link>
          </p>
          <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-4">
             <Link href="/" className="text-sm text-slate-500 dark:text-slate-500 hover:text-orange-600 dark:text-orange-500 transition-colors block text-center">
               Return to Home
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
