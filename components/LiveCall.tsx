
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration, Blob } from '@google/genai';
import { CallState, Lead, UrgencyLevel, TranscriptionItem } from '../types';
import { Mic, MicOff, PhoneOff, User, Bot, AlertCircle, CheckCircle, Info, MapPin, Hash, Globe, Mail, MessageSquare, ExternalLink, Map as MapIcon, Navigation } from 'lucide-react';

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
  const inputStreamRef = useRef<MediaStream | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const transcriptEndRef = useRef<HTMLDivElement>(null);

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
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (inputSourceRef.current) {
      inputSourceRef.current.disconnect();
      inputSourceRef.current = null;
    }
    if (inputStreamRef.current) {
      inputStreamRef.current.getTracks().forEach(track => track.stop());
      inputStreamRef.current = null;
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

  useEffect(() => () => {
    stopCall();
  }, [stopCall]);

  const startCall = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      setCurrentTranscript([]);
      setExtractedInfo({});
      setGroundingLinks([]);

      const apiKey = import.meta.env.VITE_API_KEY;
      if (!apiKey) {
        setError('Missing API key. Please set VITE_API_KEY.');
        setIsConnecting(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      inputStreamRef.current = stream;

      const checkServiceArea: FunctionDeclaration = {
        name: 'checkServiceArea',
        parameters: {
          type: Type.OBJECT,
          description: 'Verifies if an address is within our service area (Springfield, Riverdale, Anytown). Returns in-area status and local alternatives if out of zone.',
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
          description: 'Finalizes the booking. Returns a unique confirmation number.',
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
          description: 'Triggers an SMS or Email confirmation send.',
          properties: {
            method: { type: Type.STRING, enum: ['sms', 'email'] },
            destination: { type: Type.STRING },
          },
          required: ['method', 'destination'],
        },
      };

      const dispatchTechnician: FunctionDeclaration = {
        name: 'dispatchTechnician',
        parameters: {
          type: Type.OBJECT,
          description: 'Escalates to an emergency dispatch.',
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
          systemInstruction: `You are the Virtual Dispatcher for "ServicePro HVAC & Plumbing".
          
          MANDATORY CONFIRMATION PROTOCOL:
          Once you successfully call 'scheduleAppointment' and receive a confirmation number:
          1. You MUST repeat the full appointment summary back to the caller clearly.
          2. Specifically say: "Great! Your appointment is confirmed. I've scheduled your [Service Type] for [Date] at [Time] at [Full Address]. Your unique confirmation number is [Number]."
          3. Immediately follow up with: "Would you like me to send these details to you via SMS or Email for your records?"

          AREA CHECKING:
          - Use 'checkServiceArea' as soon as you have an address.
          - If out of area, provide the alternative solutions returned by the tool.

          TONE: Professional, reassuring, and extremely thorough with details.`,
          tools: [{ functionDeclarations: [checkServiceArea, scheduleAppointment, sendConfirmation, dispatchTechnician] }],
        },
        callbacks: {
          onopen: () => {
            onStateChange({ isActive: true });
            setIsConnecting(false);

            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            inputSourceRef.current = source;
            scriptProcessorRef.current = scriptProcessor;
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
                  try {
                    const groundingAi = new GoogleGenAI({ apiKey });
                    const groundingResponse = await groundingAi.models.generateContent({
                      model: "gemini-2.5-flash-preview",
                      contents: `Analyze: "${addr}".
                                1. Is it in Springfield, Riverdale, or Anytown?
                                2. If no, list 3 nearby service competitors.`,
                      config: { tools: [{ googleMaps: {} }] }
                    });

                    const textRes = groundingResponse.text || "";
                    const isInArea = /yes|within|inside|in area/i.test(textRes) || /springfield|riverdale|anytown/i.test(addr.toLowerCase());
                    const chunks = groundingResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
                    const alts = textRes.split('\n').filter(l => l.includes('-')).map(l => l.trim()).slice(0, 3);

                    setGroundingLinks(chunks as any);
                    setExtractedInfo(prev => ({ ...prev, address: addr, inServiceArea: isInArea, alternativeRecommendations: !isInArea ? alts : [] }));
                    toolResult = { inArea: isInArea, alternativeRecommendations: alts };
                  } catch (e) {
                    toolResult = { inArea: true, note: "Manual verification required" };
                  }
                } 
                else if (fc.name === 'scheduleAppointment') {
                  const data = fc.args as any;
                  // Generate unique 5-digit confirmation number
                  const conf = `SVC-${Math.floor(10000 + Math.random() * 90000)}`;
                  toolResult = { confirmationNumber: conf, details: data };
                  
                  const leadUpdate = { ...data, confirmationNumber: conf, status: 'Scheduled' };
                  setExtractedInfo(prev => ({ ...prev, ...leadUpdate }));
                  onNewLead(leadUpdate);
                }
                else if (fc.name === 'sendConfirmation') {
                  const data = fc.args as any;
                  toolResult = { status: "sent", method: data.method };
                  setExtractedInfo(prev => ({ 
                    ...prev, 
                    [data.method === 'email' ? 'email' : 'phoneNumber']: data.destination 
                  }));
                }
                else if (fc.name === 'dispatchTechnician') {
                  const data = fc.args as any;
                  setExtractedInfo(prev => ({ ...prev, ...data, urgency: UrgencyLevel.EMERGENCY }));
                  onNewLead({ ...data, urgency: UrgencyLevel.EMERGENCY, status: 'Dispatched' });
                  toolResult = { result: "Immediate dispatch initiated." };
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
              source.connect(outCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
          },
          onerror: () => stopCall(),
          onclose: () => stopCall(),
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      setError(err.message || 'Call failed');
      setIsConnecting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      <div className="lg:col-span-8 flex flex-col gap-6 h-full">
        <div className="bg-slate-900 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl min-h-[320px]">
          {callState.isActive && (
            <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />
          )}

          <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl z-10 transition-all duration-500 ${callState.isActive ? 'bg-blue-600 scale-110' : 'bg-slate-800'}`}>
            {callState.isActive ? <Mic className="w-12 h-12 text-white animate-bounce" /> : <MicOff className="w-12 h-12 text-slate-500" />}
          </div>

          <div className="mt-8 text-center z-10 text-white">
            <h3 className="text-xl font-bold mb-2">{callState.isActive ? 'AI Dispatcher Active' : 'Offline'}</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              {callState.isActive ? 'Automated scheduling and zone check in progress...' : 'Start call to handle service inquiries.'}
            </p>
          </div>

          <div className="mt-8 flex gap-4 z-10">
            {!callState.isActive ? (
              <button onClick={startCall} disabled={isConnecting} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all flex items-center gap-2">
                {isConnecting ? 'Starting...' : 'Go Online'}
              </button>
            ) : (
              <button onClick={stopCall} className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-500 transition-all flex items-center gap-2">
                End Call
              </button>
            )}
          </div>
          {error && <div className="absolute bottom-4 text-red-400 text-xs font-bold">{error}</div>}
        </div>

        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h4 className="font-bold text-slate-700 text-xs uppercase">Live Transcript</h4>
            {extractedInfo.inServiceArea === false && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold">Outside Service Zone</span>}
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {currentTranscript.map((item, i) => (
              <div key={i} className={`flex gap-3 ${item.speaker === 'AI' ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.speaker === 'AI' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {item.speaker === 'AI' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${item.speaker === 'AI' ? 'bg-blue-50 text-blue-900 border border-blue-100' : 'bg-slate-50 text-slate-800 border border-slate-200'}`}>
                  {item.text}
                </div>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500" /> Lead Summary
            </h4>
            {extractedInfo.confirmationNumber && <span className="text-xs font-black bg-blue-600 text-white px-2 py-1 rounded shadow-lg">{extractedInfo.confirmationNumber}</span>}
          </div>

          <div className="space-y-4">
            <DetailItem label="Full Name" value={extractedInfo.fullName} />
            <DetailItem label="Phone" value={extractedInfo.phoneNumber} />
            <DetailItem label="Address" value={extractedInfo.address} />
            <DetailItem label="Service" value={extractedInfo.serviceType} />
            <DetailItem label="Schedule" value={extractedInfo.appointmentDate ? `${extractedInfo.appointmentDate} at ${extractedInfo.appointmentTime}` : null} />
          </div>

          {extractedInfo.alternativeRecommendations && extractedInfo.alternativeRecommendations.length > 0 && (
            <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-[10px] font-black text-amber-800 uppercase mb-2">Nearby Alternatives Provided:</p>
              <ul className="space-y-1">
                {extractedInfo.alternativeRecommendations.map((r, i) => <li key={i} className="text-xs text-amber-700 font-medium">• {r}</li>)}
              </ul>
            </div>
          )}

          <div className="mt-4 pt-6 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-2">
              <StatusBox label="Zone Verified" active={extractedInfo.inServiceArea !== undefined} />
              <StatusBox label="Booked" active={!!extractedInfo.confirmationNumber} />
              <StatusBox label="SMS Sent" active={!!extractedInfo.phoneNumber && !!extractedInfo.confirmationNumber} />
              <StatusBox label="Ready" active={!!extractedInfo.fullName && !!extractedInfo.address} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }: { label: string, value?: string | null }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-xs font-medium min-h-[32px]">
      {value || '...'}
    </div>
  </div>
);

const StatusBox = ({ label, active }: { label: string, active: boolean }) => (
  <div className={`p-2 rounded-lg border text-[10px] font-bold text-center uppercase transition-all ${active ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
    {label}
  </div>
);

export default LiveCall;
