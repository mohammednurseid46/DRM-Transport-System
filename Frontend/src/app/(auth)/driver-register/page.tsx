"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Car, FileText, CheckCircle2, AlertCircle, UploadCloud, ChevronRight, Lock, ArrowLeft, X, Zap } from "lucide-react";
import { registerUser } from "@/lib/auth";
import { driverRegisterSchema, DriverRegisterInput } from "@/lib/validations/auth";

export default function DriverRegisterPage() {
  const router = useRouter();
  
  // Step management
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [apiError, setApiError] = useState("");
  
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<DriverRegisterInput>({
    resolver: zodResolver(driverRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      plateNumber: "",
      vehicleModel: "",
      year: "",
      color: "",
      tier: "Economy",
      seatCapacity: "4",
      licenceNumber: "",
      licenceExpiry: "",
    },
    mode: "onChange"
  });

  const handleNext = async () => {
    setApiError("");
    
    let fieldsToValidate: (keyof DriverRegisterInput)[] = [];
    if (step === 1) {
      fieldsToValidate = ["name", "email", "phone", "password"];
    } else if (step === 2) {
      fieldsToValidate = ["plateNumber", "vehicleModel", "year", "color", "tier", "seatCapacity", "licenceNumber", "licenceExpiry"];
    }

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => setStep(step - 1);

  const onSubmit = async (data: DriverRegisterInput) => {
    setApiError("");

    const res = await registerUser({
      ...data,
      role: "driver",
      is_verified: false,
      createdAt: new Date().toISOString(),
    });

    if (res.success) {
      setIsSubmitted(true);
    } else {
      setApiError(res.message);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-4 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-2xl shadow-2xl text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Application Submitted</h2>
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-yellow-500/90 leading-relaxed">
            <p className="font-semibold mb-2 flex items-center justify-center gap-2">
              <Lock size={16} /> Pending Admin Approval
            </p>
            Your driver application and KYC documents have been received. You will be notified once our team completes the verification process.
          </div>
          <button 
            onClick={() => router.push("/")}
            className="mt-6 w-full py-3 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-white font-bold rounded-lg transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white font-sans relative">
      {/* Top Navigation */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-orange-500 transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm">Back to Home</span>
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 shadow-lg shadow-orange-500/20">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white hidden sm:block tracking-tight">Dream More</span>
        </Link>
      </div>

      <div className="w-full max-w-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-2xl shadow-2xl mt-12 relative overflow-hidden">
        {/* Close Button */}
        <Link href="/" className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors z-20 bg-white/5 hover:bg-white/10 p-2 rounded-full">
          <X size={20} />
        </Link>
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Partner with Dream More</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Complete your registration to start driving.</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-black/5 dark:bg-white/5 -z-10 -translate-y-1/2"></div>
          
          <div className={`flex flex-col items-center gap-2 ${step >= 1 ? 'text-orange-500' : 'text-slate-500'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-4 border-white dark:border-slate-800 ${step >= 1 ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>1</div>
            <span className="text-xs font-semibold uppercase tracking-wider">Personal</span>
          </div>
          <div className={`flex flex-col items-center gap-2 ${step >= 2 ? 'text-orange-500' : 'text-slate-500'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-4 border-white dark:border-slate-800 ${step >= 2 ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>2</div>
            <span className="text-xs font-semibold uppercase tracking-wider">Vehicle</span>
          </div>
          <div className={`flex flex-col items-center gap-2 ${step >= 3 ? 'text-orange-500' : 'text-slate-500'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-4 border-white dark:border-slate-800 ${step >= 3 ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>3</div>
            <span className="text-xs font-semibold uppercase tracking-wider">Documents</span>
          </div>
        </div>

        {apiError && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-500 text-sm">
            <AlertCircle size={18} />
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                 <User size={18} className="text-orange-500" /> Personal Information
               </div>
               <div className="space-y-4">
                 <div>
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                   <input type="text" {...register("name")} className={`w-full bg-slate-100 dark:bg-slate-900 border ${errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors`} placeholder="Abebe Kebede" />
                   {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
                   <input type="email" {...register("email")} className={`w-full bg-slate-100 dark:bg-slate-900 border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors`} placeholder="driver@example.com" />
                   {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Phone Number</label>
                   <input type="tel" {...register("phone")} className={`w-full bg-slate-100 dark:bg-slate-900 border ${errors.phone ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors`} placeholder="+251 911 000 000" />
                   {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Password</label>
                   <input type="password" {...register("password")} className={`w-full bg-slate-100 dark:bg-slate-900 border ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors`} placeholder="••••••••" />
                   {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                 </div>
               </div>
            </div>
          )}

          {/* Step 2: Vehicle Info */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                 <Car size={18} className="text-orange-500" /> Vehicle & Licence Details
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Licence Number</label>
                   <input type="text" {...register("licenceNumber")} className={`w-full bg-slate-100 dark:bg-slate-900 border ${errors.licenceNumber ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors`} placeholder="LIC-123456" />
                   {errors.licenceNumber && <p className="text-xs text-red-500 mt-1">{errors.licenceNumber.message}</p>}
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Licence Expiry</label>
                   <input type="date" {...register("licenceExpiry")} className={`w-full bg-slate-100 dark:bg-slate-900 border ${errors.licenceExpiry ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors`} />
                   {errors.licenceExpiry && <p className="text-xs text-red-500 mt-1">{errors.licenceExpiry.message}</p>}
                 </div>
                 <div className="col-span-2">
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Plate Number</label>
                   <input type="text" {...register("plateNumber")} className={`w-full bg-slate-100 dark:bg-slate-900 border ${errors.plateNumber ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors`} placeholder="e.g. A 12345 AA" />
                   {errors.plateNumber && <p className="text-xs text-red-500 mt-1">{errors.plateNumber.message}</p>}
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Make & Model</label>
                   <input type="text" {...register("vehicleModel")} className={`w-full bg-slate-100 dark:bg-slate-900 border ${errors.vehicleModel ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors`} placeholder="Toyota Corolla" />
                   {errors.vehicleModel && <p className="text-xs text-red-500 mt-1">{errors.vehicleModel.message}</p>}
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Year</label>
                   <input type="text" {...register("year")} className={`w-full bg-slate-100 dark:bg-slate-900 border ${errors.year ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors`} placeholder="2018" />
                   {errors.year && <p className="text-xs text-red-500 mt-1">{errors.year.message}</p>}
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Color</label>
                   <input type="text" {...register("color")} className={`w-full bg-slate-100 dark:bg-slate-900 border ${errors.color ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors`} placeholder="Silver" />
                   {errors.color && <p className="text-xs text-red-500 mt-1">{errors.color.message}</p>}
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Tier</label>
                   <select {...register("tier")} className={`w-full bg-slate-100 dark:bg-slate-900 border ${errors.tier ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors appearance-none`}>
                     <option value="Economy">Economy</option>
                     <option value="Comfort">Comfort</option>
                     <option value="Premium">Premium</option>
                   </select>
                   {errors.tier && <p className="text-xs text-red-500 mt-1">{errors.tier.message}</p>}
                 </div>
                 <div className="col-span-2">
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Seat Capacity</label>
                   <select {...register("seatCapacity")} className={`w-full bg-slate-100 dark:bg-slate-900 border ${errors.seatCapacity ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors appearance-none`}>
                     <option value="4">4 Seats</option>
                     <option value="6">6 Seats (Minivan)</option>
                     <option value="12">12+ Seats (Minibus)</option>
                   </select>
                   {errors.seatCapacity && <p className="text-xs text-red-500 mt-1">{errors.seatCapacity.message}</p>}
                 </div>
               </div>
            </div>
          )}

          {/* Step 3: Documents Upload */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                 <FileText size={18} className="text-orange-500" /> Document Upload
               </div>
               <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Upload clear pictures of your documents for verification. (Mock File Inputs)</p>
               
               <div className="space-y-4">
                  {/* Upload Block 1 */}
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                    <UploadCloud size={24} className="mx-auto text-slate-500 group-hover:text-orange-500 mb-2 transition-colors" />
                    <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Driver's License (Front & Back)</p>
                    <p className="text-xs text-slate-500">Click to upload or drag and drop</p>
                  </div>
                  {/* Upload Block 2 */}
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                    <UploadCloud size={24} className="mx-auto text-slate-500 group-hover:text-orange-500 mb-2 transition-colors" />
                    <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Vehicle Registration (Bolo)</p>
                    <p className="text-xs text-slate-500">Click to upload or drag and drop</p>
                  </div>
                  {/* Upload Block 3 */}
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                    <UploadCloud size={24} className="mx-auto text-slate-500 group-hover:text-orange-500 mb-2 transition-colors" />
                    <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Comprehensive Insurance</p>
                    <p className="text-xs text-slate-500">Click to upload or drag and drop</p>
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
                className="px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white font-medium rounded-lg transition-colors flex-1"
              >
                Back
              </button>
            )}
            
            {step < 3 ? (
              <button 
                type="button" 
                onClick={handleNext}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors flex-1 flex items-center justify-center gap-2"
              >
                Next <ChevronRight size={18} />
              </button>
            ) : (
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors flex-1 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(229,112,54,0.4)] disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit KYC for Verification"}
              </button>
            )}
          </div>

        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Already a partner? <Link href="/login" className="text-orange-500 hover:underline">Sign in here</Link>
        </div>
        <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
           <Link href="/" className="text-sm text-slate-500 hover:text-orange-500 transition-colors block text-center">
             Return to Home
           </Link>
        </div>
      </div>
    </div>
  );
}
