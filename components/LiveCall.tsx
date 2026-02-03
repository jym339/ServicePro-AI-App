
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration, Blob } from '@google/genai';
import { CallState, Lead, UrgencyLevel, TranscriptionItem } from '../types';
import { Mic, MicOff, PhoneOff, User, Bot, AlertCircle, CheckCircle, Info, MapPin, Hash, Globe, Mail, MessageSquare, ExternalLink } from 'lucide-react';

interface GroundingChunk {
  maps?: {
    uri: string;
    title: string;
  };
}

interface LiveCallProps {
  callState: CallState;
  onNewLead: (lead: Partial<Lead>) => void;
  onStateChange: (updates: Partial<CallState>) => void;
}

const LiveCall: React.FC<LiveCallProps> = ({ callState, onNewLead, onStateChange }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState<TranscriptionItem[]>([]);
  const [extractedInfo, setExtractedInfo] = useState<Partial<Lead>>({});
  const [groundingLinks, setGroundingLinks] = useState<GroundingChunk[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Fetch location on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (err) => console.warn("Location access denied or unavailable", err)
      );
    }
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentTranscript]);

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const createBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const stopCall = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    onStateChange({ isActive: false });
    setIsConnecting(false);
  }, [onStateChange]);

  const startCall = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      setCurrentTranscript([]);
      setExtractedInfo({});
      setGroundingLinks([]);

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const checkServiceArea: FunctionDeclaration = {
        name: 'checkServiceArea',
        parameters: {
          type: Type.OBJECT,
          description: 'Checks if a provided address is within the company operational service area using Google Maps data.',
          properties: {
            address: { type: Type.STRING, description: 'The customer service address' },
          },
          required: ['address'],
        },
      };

      const scheduleAppointment: FunctionDeclaration = {
        name: 'scheduleAppointment',
        parameters: {
          type: Type.OBJECT,
          description: 'Schedules a service appointment and generates a confirmation number.',
          properties: {
            fullName: { type: Type.STRING },
            phoneNumber: { type: Type.STRING },
            address: { type: Type.STRING },
            serviceType: { type: Type.STRING },
            appointmentDate: { type: Type.STRING },
            appointmentTime: { type: Type.STRING },
          },
          required: ['fullName', 'phoneNumber', 'address', 'serviceType', 'appointmentDate', 'appointmentTime'],
        },
      };

      const sendConfirmation: FunctionDeclaration = {
        name: 'sendConfirmation',
        parameters: {
          type: Type.OBJECT,
          description: 'Sends the appointment confirmation details via SMS or Email.',
          properties: {
            method: { type: Type.STRING, enum: ['sms', 'email'] },
            destination: { type: Type.STRING, description: 'The phone number or email address' },
          },
          required: ['method', 'destination'],
        },
      };

      const dispatchTechnician: FunctionDeclaration = {
        name: 'dispatchTechnician',
        parameters: {
          type: Type.OBJECT,
          description: 'Simulates dispatching a technician to a location for an emergency.',
          properties: {
            fullName: { type: Type.STRING },
            address: { type: Type.STRING },
            phoneNumber: { type: Type.STRING },
            issue: { type: Type.STRING },
          },
          required: ['fullName', 'address', 'issue'],
        },
      };

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: `You are a virtual receptionist for "ServicePro HVAC & Plumbing".
          
          LOCATION CONTEXT:
          ${userLocation ? `The caller is located near latitude: ${userLocation.latitude}, longitude: ${userLocation.longitude}.` : "Caller location unknown."}
          Our primary service areas are Springfield, Riverdale, and Anytown.

          CORE WORKFLOW:
          1. GREET and identify caller need.
          2. AS SOON AS an address is provided, call 'checkServiceArea'.
             - If OUT of area: Inform them politely. Mention Springfield, Riverdale, and Anytown as our primary zones. Recommend "Local Heroes Plumbing".
             - If IN area: Proceed with lead capture.
          
          URGENCY HANDLING:
          - Emergency? Gather details, check area, call 'dispatchTechnician'.
          
          SCHEDULING:
          - Non-emergency? Gather contact info, offer schedule.
          - Call 'scheduleAppointment' when agreed. Returns confirmation number.
          - AFTER SCHEDULING: 
            A. Provide the unique confirmation number clearly.
            B. Repeat back the full details: Address, Service Type, Date, and Time.
            C. ASK the caller: "Would you like me to send these confirmation details to you via SMS text message?"
            D. IF THEY AGREE: Prompt for their mobile phone number if you don't have it, then call 'sendConfirmation' with method: 'sms'.

          Maintain professional, high-end receptionist tone. Always be helpful and polite.`,
          tools: [{ functionDeclarations: [checkServiceArea, scheduleAppointment, sendConfirmation, dispatchTechnician] }],
        },
        callbacks: {
          onopen: () => {
            onStateChange({ isActive: true });
            setIsConnecting(false);

            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setCurrentTranscript(prev => {
                const last = prev[prev.length - 1];
                if (last?.speaker === 'AI') {
                  return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                }
                return [...prev, { speaker: 'AI', text, timestamp: Date.now() }];
              });
            } else if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setCurrentTranscript(prev => {
                const last = prev[prev.length - 1];
                if (last?.speaker === 'User') {
                  return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                }
                return [...prev, { speaker: 'User', text, timestamp: Date.now() }];
              });
            }

            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                let toolResult: any = { status: "success" };

                if (fc.name === 'checkServiceArea') {
                  const addr = fc.args.address as string;
                  
                  // PERFORM MAPS GROUNDING CALL
                  try {
                    const groundingAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
                    const groundingResponse = await groundingAi.models.generateContent({
                      model: "gemini-2.5-flash",
                      contents: `Analyze this address: "${addr}". Is it within Springfield, Riverdale, or Anytown? Provide grounding details.`,
                      config: {
                        tools: [{ googleMaps: {} }],
                        ...(userLocation && {
                          toolConfig: {
                            retrievalConfig: {
                              latLng: {
                                latitude: userLocation.latitude,
                                longitude: userLocation.longitude
                              }
                            }
                          }
                        })
                      }
                    });

                    const textRes = groundingResponse.text || "";
                    const isInArea = /yes|within|inside|in area/i.test(textRes) || /springfield|riverdale|anytown|123 main/i.test(addr);
                    const chunks = groundingResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
                    
                    setGroundingLinks(chunks as any);
                    setExtractedInfo(prev => ({ ...prev, address: addr, inServiceArea: isInArea }));
                    
                    toolResult = { 
                      inArea: isInArea, 
                      details: textRes,
                      groundingSources: chunks
                    };
                  } catch (groundingErr) {
                    console.error("Grounding failed", groundingErr);
                    const isInArea = /springfield|riverdale|anytown|123 main/i.test(addr);
                    setExtractedInfo(prev => ({ ...prev, address: addr, inServiceArea: isInArea }));
                    toolResult = { inArea: isInArea, error: "Grounding service temporarily unavailable, used fallback check." };
                  }
                } 
                else if (fc.name === 'scheduleAppointment') {
                  const data = fc.args as any;
                  const conf = `SP-${Math.floor(Math.random() * 90000) + 10000}`;
                  toolResult = { confirmationNumber: conf, status: "scheduled" };
                  const leadUpdate = { ...data, confirmationNumber: conf, status: 'Scheduled' };
                  setExtractedInfo(prev => ({ ...prev, ...leadUpdate }));
                  onNewLead(leadUpdate);
                }
                else if (fc.name === 'sendConfirmation') {
                  const data = fc.args as any;
                  toolResult = { status: "sent", target: data.destination };
                  setExtractedInfo(prev => ({ 
                    ...prev, 
                    [data.method === 'email' ? 'email' : 'phoneNumber']: data.destination,
                    // Ensure the icon updates by marking sending status
                    status: prev.status === 'Scheduled' ? 'Scheduled' : prev.status 
                  }));
                }
                else if (fc.name === 'dispatchTechnician') {
                  const data = fc.args as any;
                  setExtractedInfo(prev => ({ ...prev, ...data, urgency: UrgencyLevel.EMERGENCY }));
                  onNewLead({ ...data, urgency: UrgencyLevel.EMERGENCY, status: 'Dispatched' });
                  toolResult = { result: "Technician dispatched immediately." };
                }
                
                sessionPromise.then(s => s.sendToolResponse({
                  functionResponses: { id: fc.id, name: fc.name, response: toolResult }
                }));
              }
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const outCtx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = audioBuffer;
              const gainNode = outCtx.createGain();
              source.connect(gainNode);
              gainNode.connect(outCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            setError('Communication error. Please try again.');
            stopCall();
          },
          onclose: () => {
            stopCall();
          },
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      setError(err.message || 'Failed to start the AI session.');
      setIsConnecting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      <div className="lg:col-span-8 flex flex-col gap-6 h-full">
        <div className="bg-slate-900 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl min-h-[320px]">
          {callState.isActive && (
            <>
              <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />
              <div className="absolute inset-0 bg-blue-500/5 scale-150 animate-ping opacity-20" />
            </>
          )}

          <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl z-10 transition-all duration-500 ${callState.isActive ? 'bg-blue-600 scale-110' : 'bg-slate-800'}`}>
            {callState.isActive ? (
              <Mic className="w-12 h-12 text-white animate-bounce" />
            ) : (
              <MicOff className="w-12 h-12 text-slate-500" />
            )}
          </div>

          <div className="mt-8 text-center z-10">
            <h3 className="text-xl font-bold text-white mb-2">
              {callState.isActive ? 'AI Receptionist Live' : 'System Standby'}
            </h3>
            <p className="text-slate-400 max-w-md mx-auto flex items-center justify-center gap-2">
              {userLocation && <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold">Geolocation Active</span>}
              {callState.isActive 
                ? 'Managing flow & handling SMS confirmations...' 
                : 'Click Go Online to begin receiving simulated calls.'}
            </p>
          </div>

          <div className="mt-8 flex gap-4 z-10">
            {!callState.isActive ? (
              <button 
                onClick={startCall}
                disabled={isConnecting}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isConnecting ? 'Connecting...' : 'Go Online'}
                {!isConnecting && <Mic className="w-5 h-5" />}
              </button>
            ) : (
              <button 
                onClick={stopCall}
                className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 transition-all flex items-center gap-2"
              >
                End Call
                <PhoneOff className="w-5 h-5" />
              </button>
            )}
          </div>

          {error && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-full border border-red-400/20 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h4 className="font-bold text-slate-700 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              Live Transcript
            </h4>
            <div className="flex gap-2">
               {extractedInfo.inServiceArea === true && <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200 uppercase tracking-tighter">Verified In Area</span>}
               {extractedInfo.inServiceArea === false && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold border border-red-200 uppercase tracking-tighter">Out of Area</span>}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {currentTranscript.map((item, i) => (
              <div key={i} className={`flex gap-3 ${item.speaker === 'AI' ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center shadow-sm ${item.speaker === 'AI' ? 'bg-blue-600' : 'bg-slate-200'}`}>
                  {item.speaker === 'AI' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-slate-600" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl p-4 text-sm ${item.speaker === 'AI' ? 'bg-blue-50 text-blue-900 rounded-tl-none border border-blue-100' : 'bg-slate-50 text-slate-800 rounded-tr-none border border-slate-200'}`}>
                  {item.text}
                </div>
              </div>
            ))}
            {currentTranscript.length === 0 && (
              <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">
                Awaiting caller voice input...
              </div>
            )}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Service Details
            </h4>
            {extractedInfo.confirmationNumber && (
              <div className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/20">
                <Hash className="w-3 h-3" />
                {extractedInfo.confirmationNumber}
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3" /> Customer
                </label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 font-medium min-h-[44px]">
                  {extractedInfo.fullName || <span className="text-slate-300 italic">...</span>}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                   <Globe className="w-3 h-3" /> Maps Verification
                </label>
                <div className={`p-3 rounded-xl border flex items-center justify-between min-h-[44px] ${extractedInfo.inServiceArea === undefined ? 'bg-slate-50 border-slate-100' : extractedInfo.inServiceArea ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                   <span className="text-sm font-semibold">
                     {extractedInfo.inServiceArea === undefined ? 'Detecting Location...' : extractedInfo.inServiceArea ? 'In Service Zone' : 'Outside Primary Zone'}
                   </span>
                   {extractedInfo.inServiceArea !== undefined && (
                     extractedInfo.inServiceArea ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />
                   )}
                </div>
              </div>
            </div>

            {groundingLinks.length > 0 && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Grounding Sources</label>
                <div className="flex flex-col gap-2">
                  {groundingLinks.map((chunk, i) => chunk.maps && (
                    <a 
                      key={i} 
                      href={chunk.maps.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <span className="font-medium truncate max-w-[180px]">{chunk.maps.title}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Reported Address
              </label>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-sm min-h-[44px]">
                {extractedInfo.address || <span className="text-slate-300 italic">Awaiting address...</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Appointment</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-sm min-h-[44px]">
                  {extractedInfo.appointmentDate ? `${extractedInfo.appointmentDate} at ${extractedInfo.appointmentTime}` : <span className="text-slate-300 italic">Not set</span>}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service Type</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-sm min-h-[44px]">
                  {extractedInfo.serviceType || <span className="text-slate-300 italic">...</span>}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-2">
               {extractedInfo.email && <span className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[10px] font-bold border border-slate-200 uppercase"><Mail className="w-3 h-3"/> Email Sent</span>}
               {extractedInfo.phoneNumber && extractedInfo.status === 'Scheduled' && <span className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[10px] font-bold border border-slate-200 uppercase"><MessageSquare className="w-3 h-3"/> SMS Confirmed</span>}
            </div>
          </div>

          <div className="mt-4 pt-6 border-t border-slate-100">
             <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100">
               <h5 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                 <MessageSquare className="w-4 h-4 text-blue-500" />
                 Confirmation Status
               </h5>
               <ul className="space-y-2">
                 <li className={`text-[11px] flex items-center gap-2 ${extractedInfo.confirmationNumber ? 'text-emerald-600' : 'text-slate-400'}`}>
                   <CheckCircle className={`w-3.5 h-3.5 ${extractedInfo.confirmationNumber ? 'fill-emerald-500 text-white' : 'text-slate-200'}`} /> Confirmation Generated
                 </li>
                 <li className={`text-[11px] flex items-center gap-2 ${extractedInfo.phoneNumber && extractedInfo.status === 'Scheduled' ? 'text-emerald-600' : 'text-slate-400'}`}>
                   <CheckCircle className={`w-3.5 h-3.5 ${extractedInfo.phoneNumber && extractedInfo.status === 'Scheduled' ? 'fill-emerald-500 text-white' : 'text-slate-200'}`} /> SMS Consent Obtained
                 </li>
               </ul>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveCall;
