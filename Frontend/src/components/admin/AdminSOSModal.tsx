import React, { useEffect, useState } from 'react';
import { AlertOctagon, PhoneCall, ShieldAlert, X } from 'lucide-react';

interface AdminSOSModalProps {
  sosData: any;
  onDismiss: () => void;
}

export default function AdminSOSModal({ sosData, onDismiss }: AdminSOSModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let audioCtx: AudioContext | null = null;
    let oscillator: OscillatorNode | null = null;
    let gainNode: GainNode | null = null;
    let interval: NodeJS.Timeout;

    const playSiren = () => {
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        oscillator = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // Siren effect: alternate frequency
        const time = audioCtx.currentTime;
        oscillator.type = 'square';
        
        oscillator.frequency.setValueAtTime(600, time);
        oscillator.frequency.setValueAtTime(800, time + 0.4);
        
        gainNode.gain.setValueAtTime(0.1, time);
        
        oscillator.start(time);
        oscillator.stop(time + 0.8);
      } catch (e) {
        console.warn("Audio API not supported or blocked", e);
      }
    };

    setIsPlaying(true);
    playSiren();
    interval = setInterval(playSiren, 1000);

    return () => {
      clearInterval(interval);
      setIsPlaying(false);
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close();
      }
    };
  }, []);

  if (!sosData) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-red-950/90 backdrop-blur-sm p-4">
      {/* Flashing background effect */}
      <div className="absolute inset-0 bg-red-600/20 animate-[pulse_0.5s_ease-in-out_infinite]"></div>
      
      <div className="bg-slate-900 border-4 border-red-500 rounded-3xl w-full max-w-2xl shadow-[0_0_100px_rgba(239,68,68,0.5)] overflow-hidden relative z-10 animate-in zoom-in duration-300">
        
        <div className="bg-red-600 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white p-6 flex flex-col items-center justify-center text-center">
          <div className="bg-white/20 p-4 rounded-full mb-4 animate-[bounce_1s_infinite]">
            <AlertOctagon size={64} className="text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white drop-shadow-md" />
          </div>
          <h1 className="text-4xl font-black tracking-widest uppercase drop-shadow-md mb-2">Critical SOS Alert</h1>
          <p className="text-red-100 font-bold text-lg">Immediate Action Required</p>
        </div>

        <div className="p-8 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Triggered By</div>
              <div className="text-xl font-bold text-red-400">{sosData.triggeredBy}</div>
              <div className="text-sm font-medium mt-1">{sosData.name}</div>
              <div className="flex items-center gap-2 mt-3 bg-slate-900 p-2 rounded border border-slate-700 font-mono text-sm">
                <PhoneCall size={14} className="text-slate-400" />
                {sosData.phone}
              </div>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Vehicle / Driver Info</div>
              <div className="text-xl font-bold">{sosData.driverName || "Unknown"}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 px-2 py-1 rounded font-mono font-bold">
                  {sosData.plate || "No Plate"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-red-950/50 border border-red-900/50 p-4 rounded-xl mb-8">
            <div className="flex items-start gap-4">
              <ShieldAlert className="text-red-500 shrink-0 mt-1" size={24} />
              <div>
                <div className="text-sm font-bold text-red-400 mb-2 uppercase tracking-wider">Last Known Route</div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="font-medium">{sosData.pickup}</div>
                </div>
                <div className="w-0.5 h-4 bg-slate-700 ml-1.5 my-1"></div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="font-medium">{sosData.destination}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={onDismiss}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-bold py-4 rounded-xl transition-colors border border-slate-700 flex items-center justify-center gap-2"
            >
              <X size={20} /> Acknowledge & Mute
            </button>
            <button className="flex-1 bg-red-600 hover:bg-red-700 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-red-600/30 flex items-center justify-center gap-2">
              <PhoneCall size={20} /> Dispatch Authorities
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
