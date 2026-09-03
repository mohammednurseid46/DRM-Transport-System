import React from 'react';
import { Activity, Car, CreditCard, ShieldAlert, Users } from 'lucide-react';

export type DispatchEvent = {
  id: string;
  timestamp: string;
  type: 'BOOKING' | 'ACCEPTED' | 'COMPLETED' | 'SOS' | 'SYSTEM';
  message: string;
};

export default function AdminDispatchFeed({ events }: { events: DispatchEvent[] }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'BOOKING': return <Users size={16} className="text-blue-500" />;
      case 'ACCEPTED': return <Car size={16} className="text-orange-500" />;
      case 'COMPLETED': return <CreditCard size={16} className="text-green-500" />;
      case 'SOS': return <ShieldAlert size={16} className="text-red-500" />;
      default: return <Activity size={16} className="text-slate-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'BOOKING': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30';
      case 'ACCEPTED': return 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/30';
      case 'COMPLETED': return 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30';
      case 'SOS': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50';
      default: return 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col h-full overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50">
        <Activity size={18} className="text-slate-500 dark:text-slate-400" />
        <h2 className="font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">Live Dispatch Feed</h2>
        <div className="ml-auto flex gap-1 items-center">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase ml-1">Live</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {events.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
            Waiting for activity...
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className={`p-3 rounded-xl border flex gap-3 animate-in fade-in slide-in-from-left-4 duration-300 ${getBgColor(event.type)}`}>
              <div className="mt-0.5 shrink-0">
                {getIcon(event.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white leading-snug">
                  {event.message}
                </p>
                <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
                  {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
