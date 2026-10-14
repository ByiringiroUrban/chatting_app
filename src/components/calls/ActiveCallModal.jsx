import React from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Volume2, 
  VolumeX, 
  Maximize2 
} from 'lucide-react';
import { useCallStore } from '../../stores/callStore';
import Avatar from '../common/Avatar';

export default function ActiveCallModal() {
  const { 
    activeCall, 
    endCall, 
    acceptIncomingCall, 
    toggleMute, 
    toggleCamera, 
    toggleSpeaker 
  } = useCallStore();

  if (!activeCall) return null;

  const { contact, type, status, isMuted, isCameraOff, isSpeakerOn, durationSeconds } = activeCall;

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isIncoming = status === 'incoming_ringing';
  const isRinging = status === 'ringing';
  const isConnected = status === 'connected';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center p-6 text-white text-center animate-slide-up">
        
        {/* Call Type Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 text-xs font-semibold text-slate-300 mb-6">
          {type === 'video' ? <Video className="w-3.5 h-3.5 text-teal-400" /> : <Phone className="w-3.5 h-3.5 text-teal-400" />}
          <span className="uppercase tracking-wider">
            {type} Call • {isConnected ? formatDuration(durationSeconds) : isIncoming ? 'Incoming...' : 'Calling...'}
          </span>
        </div>

        {/* Video Simulation Screen or Avatar */}
        <div className="relative w-36 h-36 mb-6">
          {type === 'video' && isConnected && !isCameraOff ? (
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-brand-500 shadow-xl relative animate-pulse-subtle">
              <img 
                src={contact.avatar} 
                alt={contact.name} 
                className="w-full h-full object-cover filter brightness-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end justify-center pb-2">
                <span className="text-[10px] text-teal-300 font-semibold">HD 1080p Video</span>
              </div>
            </div>
          ) : (
            <div className="relative inline-block">
              <Avatar 
                src={contact.avatar} 
                alt={contact.name} 
                size="2xl" 
                className={`ring-4 ${isRinging || isIncoming ? 'ring-teal-500 animate-ping ring-opacity-30' : 'ring-slate-700'}`} 
              />
              {type === 'video' && isCameraOff && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                  <VideoOff className="w-6 h-6 text-slate-300" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contact Info */}
        <h2 className="text-xl font-bold tracking-tight text-white mb-1">{contact.name}</h2>
        <p className="text-xs text-slate-400 mb-8">{contact.phone || contact.bio || "Muraho Contact"}</p>

        {/* Status Text Indicator */}
        <div className="text-sm font-medium mb-8">
          {isRinging && <span className="text-amber-400 animate-pulse">Ringing...</span>}
          {isIncoming && <span className="text-teal-400 animate-bounce">Incoming call from {contact.name}...</span>}
          {isConnected && <span className="text-emerald-400 font-semibold">{formatDuration(durationSeconds)}</span>}
        </div>

        {/* Action Controls */}
        {isIncoming ? (
          <div className="flex items-center gap-6">
            <button
              onClick={endCall}
              className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
              title="Decline"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            <button
              onClick={acceptIncomingCall}
              className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
              title="Accept"
            >
              <Phone className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {/* Mute Toggle */}
            <button
              onClick={toggleMute}
              className={`p-3.5 rounded-full transition-all ${isMuted ? 'bg-rose-600/20 text-rose-400 ring-2 ring-rose-500' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              title={isMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Video Toggle (if video call) */}
            {type === 'video' && (
              <button
                onClick={toggleCamera}
                className={`p-3.5 rounded-full transition-all ${isCameraOff ? 'bg-rose-600/20 text-rose-400 ring-2 ring-rose-500' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                title={isCameraOff ? "Turn On Camera" : "Turn Off Camera"}
              >
                {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
            )}

            {/* Speaker Toggle */}
            <button
              onClick={toggleSpeaker}
              className={`p-3.5 rounded-full transition-all ${isSpeakerOn ? 'bg-teal-600/20 text-teal-400 ring-2 ring-teal-500' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              title="Speakerphone"
            >
              {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* End Call Button */}
            <button
              onClick={endCall}
              className="p-3.5 px-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
              title="End Call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
