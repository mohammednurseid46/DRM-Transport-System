"use client";

import React, { useState } from "react";
import { MessageSquareWarning, Search, Filter, ShieldAlert, CheckCircle, Clock, X, MessageCircle, AlertTriangle } from "lucide-react";

type TicketPriority = "High" | "Medium" | "Low";
type TicketStatus = "Open" | "In Progress" | "Resolved";
type ReporterRole = "Passenger" | "Driver";

interface Ticket {
  id: string;
  reporter: string;
  role: ReporterRole;
  category: "Fare Dispute" | "Lost Item" | "Driver Behavior" | "Passenger Behavior" | "App Issue";
  priority: TicketPriority;
  status: TicketStatus;
  date: string;
  description: string;
  rideId?: string;
  logs: { sender: string; message: string; time: string }[];
}

const MOCK_TICKETS: Ticket[] = [
  {
    id: "TCK-9921",
    reporter: "Abebe B.",
    role: "Passenger",
    category: "Fare Dispute",
    priority: "High",
    status: "Open",
    date: "2026-08-26 10:15 AM",
    description: "Driver charged me 450 ETB but the app said 350 ETB locked fare.",
    rideId: "R-1001",
    logs: [
      { sender: "Abebe B.", message: "The driver refused to accept the 350 ETB and demanded 450.", time: "10:15 AM" }
    ]
  },
  {
    id: "TCK-9922",
    reporter: "Dawit M.",
    role: "Driver",
    category: "Passenger Behavior",
    priority: "Medium",
    status: "In Progress",
    date: "2026-08-25 04:30 PM",
    description: "Passenger spilled coffee in the back seat.",
    rideId: "R-1005",
    logs: [
      { sender: "Dawit M.", message: "The passenger made a mess. I need compensation for cleaning.", time: "04:30 PM" },
      { sender: "Admin Support", message: "We are reviewing the ride details and will contact the passenger.", time: "05:00 PM" }
    ]
  },
  {
    id: "TCK-9923",
    reporter: "Sara K.",
    role: "Passenger",
    category: "Lost Item",
    priority: "Low",
    status: "Resolved",
    date: "2026-08-24 09:00 AM",
    description: "I left my umbrella in the shared ride.",
    rideId: "R-1002",
    logs: [
      { sender: "Sara K.", message: "I left a black umbrella in the backseat.", time: "09:00 AM" },
      { sender: "Admin Support", message: "We contacted the driver, he found it and will drop it at the office.", time: "11:00 AM" },
      { sender: "Admin Support", message: "Umbrella returned to passenger.", time: "02:00 PM" }
    ]
  }
];

export default function AdminComplaintsPage() {
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | "Open" | "In Progress" | "Resolved">("All");
  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.reporter.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (!matchesSearch) return false;
    
    switch (activeTab) {
      case "Open": return t.status === "Open";
      case "In Progress": return t.status === "In Progress";
      case "Resolved": return t.status === "Resolved";
      default: return true;
    }
  });

  const getPriorityColor = (priority: TicketPriority) => {
    switch(priority) {
      case "High": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      case "Medium": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "Low": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    }
  };

  const getStatusIcon = (status: TicketStatus) => {
    switch(status) {
      case "Open": return <AlertTriangle size={14} className="text-red-500" />;
      case "In Progress": return <Clock size={14} className="text-amber-500" />;
      case "Resolved": return <CheckCircle size={14} className="text-emerald-500" />;
    }
  };

  const handleSendReply = () => {
    if (!replyMessage.trim() || !selectedTicket) return;
    
    const updatedTicket = {
      ...selectedTicket,
      status: selectedTicket.status === "Open" ? "In Progress" as const : selectedTicket.status,
      logs: [
        ...selectedTicket.logs,
        { sender: "Admin Support", message: replyMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]
    };

    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    setSelectedTicket(updatedTicket);
    setReplyMessage("");
  };

  const handleResolve = () => {
    if (!selectedTicket) return;
    
    const updatedTicket = {
      ...selectedTicket,
      status: "Resolved" as const,
      logs: [
        ...selectedTicket.logs,
        { sender: "System", message: "Ticket marked as Resolved by Admin.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]
    };

    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    setSelectedTicket(null);
  };

  const issueAction = (type: "refund" | "penalty") => {
    alert(`Action: ${type.toUpperCase()} initiated for Ticket ${selectedTicket?.id}`);
  };

  return (
    <div className="flex h-full flex-col md:flex-row relative overflow-hidden">
      
      {/* Main Issue Tracker */}
      <div className={`flex-1 p-6 md:p-8 overflow-y-auto transition-all ${selectedTicket ? 'md:pr-[400px]' : ''}`}>
        <div className="max-w-5xl mx-auto space-y-6">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquareWarning className="text-orange-600 dark:text-orange-500" /> Complaints & Disputes
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage user issues, fare disputes, and support tickets.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
            <div className="flex overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0 md:pb-0 hide-scrollbar gap-2 w-full md:w-auto">
              {["All", "Open", "In Progress", "Resolved"].map((tab) => (
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
                placeholder="Search Ticket ID, Name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-orange-500 text-sm dark:text-slate-900 dark:text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Ticket List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredTickets.length > 0 ? (
              filteredTickets.map(ticket => (
                <div 
                  key={ticket.id} 
                  onClick={() => setSelectedTicket(ticket)}
                  className={`bg-white dark:bg-slate-800 rounded-xl border p-5 cursor-pointer transition-all hover:shadow-md ${selectedTicket?.id === ticket.id ? 'border-orange-500 dark:border-orange-500 ring-1 ring-orange-500' : 'border-slate-200 dark:border-slate-700'}`}
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold font-mono text-slate-500">{ticket.id}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority} Priority
                        </span>
                        <span className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                          {getStatusIcon(ticket.status)} {ticket.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-1">{ticket.category}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">{ticket.description}</p>
                    </div>
                    <div className="sm:text-right flex flex-col justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{ticket.reporter}</p>
                        <p className="text-xs text-slate-500">Role: {ticket.role}</p>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 sm:mt-0">{ticket.date}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                No tickets found matching your criteria.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dispute Resolution Drawer (Side Panel on Desktop, Modal on Mobile) */}
      {selectedTicket && (
        <div className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white dark:bg-slate-800 shadow-2xl border-l border-slate-200 dark:border-slate-700 z-50 flex flex-col animate-in slide-in-from-right">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white flex items-center gap-2">
                Ticket Details
              </h3>
              <p className="text-xs font-mono text-slate-500">{selectedTicket.id}</p>
            </div>
            <button onClick={() => setSelectedTicket(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Meta Info */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 space-y-3 border border-slate-100 dark:border-slate-700">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Reporter</p>
                  <p className="font-medium text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{selectedTicket.reporter}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Role</p>
                  <p className="font-medium text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{selectedTicket.role}</p>
                </div>
                {selectedTicket.rideId && (
                  <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700 mt-1">
                    <p className="text-xs text-slate-500 mb-0.5">Associated Ride</p>
                    <a href="#" className="font-mono text-orange-600 dark:text-orange-500 hover:underline">{selectedTicket.rideId}</a>
                  </div>
                )}
              </div>
            </div>

            {/* Conversation Logs */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <MessageCircle size={14}/> Conversation Logs
              </h4>
              <div className="space-y-4">
                {selectedTicket.logs.map((log, idx) => (
                  <div key={idx} className={`flex flex-col ${log.sender === "Admin Support" || log.sender === "System" ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-slate-400 mb-1 px-1">{log.sender} • {log.time}</span>
                    <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${
                      log.sender === "System" ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 italic border border-slate-200 dark:border-slate-700' :
                      log.sender === "Admin Support" ? 'bg-orange-500 text-slate-900 dark:text-slate-900 dark:text-white rounded-tr-sm shadow-sm' : 
                      'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white rounded-tl-sm border border-slate-200 dark:border-slate-600 shadow-sm'
                    }`}>
                      {log.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Drawer Footer Actions */}
          {selectedTicket.status !== "Resolved" && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type a reply..."
                  className="flex-1 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 dark:text-slate-900 dark:text-slate-900 dark:text-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                />
                <button 
                  onClick={handleSendReply}
                  className="bg-orange-500 hover:bg-orange-600 text-slate-900 dark:text-slate-900 dark:text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                  Send
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                 {selectedTicket.category === "Fare Dispute" && (
                   <button onClick={() => issueAction("refund")} className="py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
                     Issue Refund
                   </button>
                 )}
                 {(selectedTicket.category === "Driver Behavior" || selectedTicket.category === "Passenger Behavior") && (
                   <button onClick={() => issueAction("penalty")} className="py-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors border border-red-100 dark:border-red-900/30">
                     Issue Penalty
                   </button>
                 )}
                 <button onClick={handleResolve} className="col-span-2 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition-colors border border-emerald-100 dark:border-emerald-900/30">
                   Mark as Resolved
                 </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
