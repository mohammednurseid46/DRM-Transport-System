"use client";

import React, { useState } from "react";
import { CreditCard, Filter, Download, ArrowUpRight, ArrowDownRight, Search, Activity, Receipt } from "lucide-react";

type TransactionStatus = "completed" | "pending" | "failed";
type PaymentMethod = "Telebirr" | "eBirr" | "Card" | "Cash";

interface Transaction {
  id: string;
  ref: string;
  rideId: string;
  driverName: string;
  method: PaymentMethod;
  amount: number;
  platformFee: number;
  driverNet: number;
  status: TransactionStatus;
  date: string;
  isShared: boolean;
  sharedSplits?: { passenger: string, amount: number, method: PaymentMethod }[];
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "TX-1001", ref: "TB-894723", rideId: "R-1001", driverName: "Dawit M.", method: "Telebirr", amount: 350, platformFee: 35, driverNet: 315, status: "completed", date: "2026-08-26 10:30 AM", isShared: false },
  { id: "TX-1002", ref: "EB-239482", rideId: "R-1002", driverName: "Solomon T.", method: "eBirr", amount: 150, platformFee: 15, driverNet: 135, status: "completed", date: "2026-08-26 09:15 AM", isShared: true, sharedSplits: [{ passenger: "Sara K.", amount: 75, method: "eBirr" }, { passenger: "Guest", amount: 75, method: "Cash" }] },
  { id: "TX-1003", ref: "CSH-0001", rideId: "R-1005", driverName: "Tewodros S.", method: "Cash", amount: 400, platformFee: 40, driverNet: 360, status: "completed", date: "2026-08-25 04:30 PM", isShared: false },
  { id: "TX-1004", ref: "CRD-9982", rideId: "R-1004", driverName: "Kaleb D.", method: "Card", amount: 120, platformFee: 12, driverNet: 108, status: "pending", date: "2026-08-26 11:00 AM", isShared: true, sharedSplits: [{ passenger: "Helen M.", amount: 60, method: "Card" }, { passenger: "Alex M.", amount: 60, method: "Card" }] },
  { id: "TX-1005", ref: "TB-894724", rideId: "R-1010", driverName: "Yared A.", method: "Telebirr", amount: 200, platformFee: 20, driverNet: 180, status: "failed", date: "2026-08-25 08:45 AM", isShared: false },
];

export default function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [activeTab, setActiveTab] = useState<"All" | "Telebirr" | "eBirr" | "Cash" | "Shared">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.ref.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.rideId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.driverName.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (!matchesSearch) return false;
    
    switch (activeTab) {
      case "Telebirr": return t.method === "Telebirr";
      case "eBirr": return t.method === "eBirr";
      case "Cash": return t.method === "Cash";
      case "Shared": return t.isShared;
      default: return true;
    }
  });

  const totalVolume = transactions.filter(t => t.status === "completed").reduce((acc, t) => acc + t.amount, 0);
  const totalPlatformFees = transactions.filter(t => t.status === "completed").reduce((acc, t) => acc + t.platformFee, 0);
  const totalDriverEarnings = transactions.filter(t => t.status === "completed").reduce((acc, t) => acc + t.driverNet, 0);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">Payments & Splits</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage platform revenue, driver settlements, and shared ride cost-splits.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Transaction Volume</p>
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
              <Activity size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">Br {totalVolume.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Platform Fees Collected (10%)</p>
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">Br {totalPlatformFees.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Driver Net Earnings</p>
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
              <ArrowDownRight size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">Br {totalDriverEarnings.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0 md:pb-0 hide-scrollbar gap-2 w-full md:w-auto">
          {["All", "Telebirr", "eBirr", "Cash", "Shared"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? "bg-slate-900 dark:bg-slate-100 text-slate-900 dark:text-slate-900 dark:text-white dark:text-slate-900" 
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Reference, Ride..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-orange-500 text-sm dark:text-slate-900 dark:text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Transactions Ledger Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium">
              <tr>
                <th className="px-6 py-4">Transaction Ref</th>
                <th className="px-6 py-4">Ride ID / Driver</th>
                <th className="px-6 py-4">Payment Method</th>
                <th className="px-6 py-4 text-right">Gross Amount</th>
                <th className="px-6 py-4 text-right">Platform Fee</th>
                <th className="px-6 py-4 text-right">Driver Net</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <React.Fragment key={tx.id}>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold font-mono text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{tx.ref}</div>
                        <div className="text-xs text-slate-500">{tx.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{tx.rideId} {tx.isShared && <span className="ml-1 inline-flex bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-[10px] px-1.5 py-0.5 rounded">SHARED</span>}</div>
                        <div className="text-xs text-slate-500">{tx.driverName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          <Receipt size={12} className="text-slate-400" /> {tx.method}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white whitespace-nowrap">
                        Br {tx.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-orange-600 dark:text-orange-500 whitespace-nowrap">
                        Br {tx.platformFee.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-green-600 dark:text-green-500 whitespace-nowrap">
                        Br {tx.driverNet.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          tx.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          tx.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                    
                    {/* Shared Ride Cost-Split Ledger Expansion */}
                    {tx.isShared && tx.sharedSplits && (
                      <tr className="bg-slate-50/50 dark:bg-slate-900/30">
                        <td colSpan={7} className="px-6 py-3 border-l-4 border-l-purple-500">
                          <div className="flex flex-col gap-2">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Shared Ride Cost-Split Ledger</p>
                            <div className="flex flex-wrap gap-4">
                              {tx.sharedSplits.map((split, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm">
                                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <span className="font-medium text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mr-2">{split.passenger}</span>
                                    <span className="text-xs text-slate-500 mr-2">via {split.method}</span>
                                    <span className="font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">Br {split.amount.toFixed(2)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
