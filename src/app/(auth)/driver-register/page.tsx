"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Car, FileText, CheckCircle2, AlertCircle, UploadCloud, ChevronRight, Lock, ArrowLeft, X, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { registerUser } from "@/lib/auth";

export default function DriverRegisterPage() {
  const router = useRouter();
  
  // Step management
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  
  // Form State
  const [formData, setFormData] = useState({
    // Personal
    name: "",
    email: "",
    phone: "",
    password: "",
    // Vehicle
    plateNumber: "",
    vehicleModel: "",
    year: "",
    color: "",
    tier: "Economy",
    seatCapacity: "4",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    setError("");
    if (step === 1 && (!formData.name || !formData.email || !formData.phone || !formData.password)) {
      setError("Please fill out all personal details.");
      return;
    }
    if (step === 2 && (!formData.plateNumber || !formData.vehicleModel || !formData.year)) {
      setError("Please fill out required vehicle details.");
      return;
    }
    setStep(step + 1);
  };

  const handlePrev = () => setStep(step - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Simulate registration with role 'driver' and is_verified: false
    const res = registerUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: "driver",
      is_verified: false,
      phone: formData.phone,
      plateNumber: formData.plateNumber,
      vehicleModel: formData.vehicleModel,
      tier: formData.tier,
      createdAt: new Date().toISOString(),
    });

    if (res.success) {
      setIsSubmitted(true);
      // We do not auto-login because the account is pending approval
    } else {
      setError(res.message);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-4 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-2xl shadow-2xl text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white tracking-tight">Application Submitted</h2>
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-yellow-500/90 leading-relaxed">
            <p className="font-semibold mb-2 flex items-center justify-center gap-2">
              <Lock size={16} /> Pending Admin Approval
            </p>
            Your driver application and KYC documents have been received. You will be notified once our team completes the verification process.
          </div>
          <button 
            onClick={() => router.push("/")}
            className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-bold rounded-lg transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-sans relative">
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

      <div className="w-full max-w-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-2xl shadow-2xl mt-12 relative overflow-hidden">
        {/* Close Button */}
        <Link href="/" className="absolute top-4 right-4 text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white transition-colors z-20 bg-white/5 hover:bg-white/10 p-2 rounded-full">
          <X size={20} />
        </Link>
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-2">Partner with Dream More</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Complete your registration to start driving.</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -z-10 -translate-y-1/2"></div>
          
          <div className={`flex flex-col items-center gap-2 ${step >= 1 ? 'text-orange-600 dark:text-orange-500' : 'text-slate-500 dark:text-slate-500'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-4 border-white dark:border-slate-900 ${step >= 1 ? 'bg-orange-500 dark:bg-orange-600 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>1</div>
            <span className="text-xs font-semibold uppercase tracking-wider">Personal</span>
          </div>
          <div className={`flex flex-col items-center gap-2 ${step >= 2 ? 'text-orange-600 dark:text-orange-500' : 'text-slate-500 dark:text-slate-500'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-4 border-white dark:border-slate-900 ${step >= 2 ? 'bg-orange-500 dark:bg-orange-600 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>2</div>
            <span className="text-xs font-semibold uppercase tracking-wider">Vehicle</span>
          </div>
          <div className={`flex flex-col items-center gap-2 ${step >= 3 ? 'text-orange-600 dark:text-orange-500' : 'text-slate-500 dark:text-slate-500'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-4 border-white dark:border-slate-900 ${step >= 3 ? 'bg-orange-500 dark:bg-orange-600 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>3</div>
            <span className="text-xs font-semibold uppercase tracking-wider">Documents</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-500 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="flex items-center gap-2 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-semibold mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                 <User size={18} className="text-orange-600 dark:text-orange-500" /> Personal Information
               </div>
               <div className="space-y-4">
                 <div>
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                   <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white focus:outline-none focus:border-dms-primary transition-colors" placeholder="Abebe Kebede" />
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
                   <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white focus:outline-none focus:border-dms-primary transition-colors" placeholder="driver@example.com" />
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Phone Number</label>
                   <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white focus:outline-none focus:border-dms-primary transition-colors" placeholder="+251 911 000 000" />
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Password</label>
                   <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white focus:outline-none focus:border-dms-primary transition-colors" placeholder="••••••••" />
                 </div>
               </div>
            </div>
          )}

          {/* Step 2: Vehicle Info */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="flex items-center gap-2 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-semibold mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                 <Car size={18} className="text-orange-600 dark:text-orange-500" /> Vehicle Details
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2">
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Plate Number</label>
                   <input type="text" name="plateNumber" value={formData.plateNumber} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white focus:outline-none focus:border-dms-primary transition-colors" placeholder="e.g. A 12345 AA" />
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Make & Model</label>
                   <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white focus:outline-none focus:border-dms-primary transition-colors" placeholder="Toyota Corolla" />
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Year</label>
                   <input type="text" name="year" value={formData.year} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white focus:outline-none focus:border-dms-primary transition-colors" placeholder="2018" />
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Color</label>
                   <input type="text" name="color" value={formData.color} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white focus:outline-none focus:border-dms-primary transition-colors" placeholder="Silver" />
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Tier</label>
                   <select name="tier" value={formData.tier} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white focus:outline-none focus:border-dms-primary transition-colors appearance-none">
                     <option value="Economy">Economy</option>
                     <option value="Comfort">Comfort</option>
                     <option value="Premium">Premium</option>
                   </select>
                 </div>
                 <div className="col-span-2">
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Seat Capacity</label>
                   <select name="seatCapacity" value={formData.seatCapacity} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white focus:outline-none focus:border-dms-primary transition-colors appearance-none">
                     <option value="4">4 Seats</option>
                     <option value="6">6 Seats (Minivan)</option>
                     <option value="12">12+ Seats (Minibus)</option>
                   </select>
                 </div>
               </div>
            </div>
          )}

          {/* Step 3: Documents Upload */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="flex items-center gap-2 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-semibold mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                 <FileText size={18} className="text-orange-600 dark:text-orange-500" /> Document Upload
               </div>
               <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Upload clear pictures of your documents for verification. (Mock File Inputs)</p>
               
               <div className="space-y-4">
                  {/* Upload Block 1 */}
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer group">
                    <UploadCloud size={24} className="mx-auto text-slate-500 dark:text-slate-500 group-hover:text-orange-600 dark:text-orange-500 mb-2 transition-colors" />
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-1">Driver's License (Front & Back)</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">Click to upload or drag and drop</p>
                  </div>
                  {/* Upload Block 2 */}
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer group">
                    <UploadCloud size={24} className="mx-auto text-slate-500 dark:text-slate-500 group-hover:text-orange-600 dark:text-orange-500 mb-2 transition-colors" />
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-1">Vehicle Registration (Bolo)</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">Click to upload or drag and drop</p>
                  </div>
                  {/* Upload Block 3 */}
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer group">
                    <UploadCloud size={24} className="mx-auto text-slate-500 dark:text-slate-500 group-hover:text-orange-600 dark:text-orange-500 mb-2 transition-colors" />
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-1">Comprehensive Insurance</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">Click to upload or drag and drop</p>
                  </div>
               </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            {step > 1 && (
              <button 
                type="button" 
                onClick={handlePrev}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-white/10 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-medium rounded-lg transition-colors flex-1"
              >
                Back
              </button>
            )}
            
            {step < 3 ? (
              <button 
                type="button" 
                onClick={handleNext}
                className="px-6 py-3 bg-orange-500 dark:bg-orange-600 hover:bg-orange-500 dark:bg-orange-600-hover text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-medium rounded-lg transition-colors flex-1 flex items-center justify-center gap-2"
              >
                Next <ChevronRight size={18} />
              </button>
            ) : (
              <button 
                type="submit"
                className="px-6 py-3 bg-orange-500 dark:bg-orange-600 hover:bg-orange-500 dark:bg-orange-600-hover text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-medium rounded-lg transition-colors flex-1 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(229,112,54,0.4)]"
              >
                Submit KYC for Verification
              </button>
            )}
          </div>

        </form>

        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-500">
          Already a partner? <Link href="/login" className="text-orange-600 dark:text-orange-500 hover:underline">Sign in here</Link>
        </div>
        <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
           <Link href="/" className="text-sm text-slate-500 dark:text-slate-500 hover:text-orange-600 dark:text-orange-500 transition-colors block text-center">
             Return to Home
           </Link>
        </div>
      </div>
    </div>
  );
}
