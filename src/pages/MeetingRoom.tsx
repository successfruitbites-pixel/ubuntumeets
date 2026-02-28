import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";
import { DailyProvider, useLocalParticipant, useVideoTrack, useAudioTrack, useScreenShare, useParticipantIds, useDaily, useDailyEvent, DailyVideo } from "@daily-co/daily-react";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { Mic, MicOff, Video, VideoOff, MonitorUp, Circle, Square, PenTool, MessageSquare, Users, LogOut, ShieldAlert, User } from "lucide-react";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

export function MeetingRoom() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const url = searchParams.get("url");
  const navigate = useNavigate();
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!url) {
      navigate("/dashboard");
      return;
    }

    const co = DailyIframe.createCallObject({
      videoSource: true,
      audioSource: true,
    });

    setCallObject(co);

    co.join({ url }).then(() => {
      console.log("Joined call");
    }).catch(err => {
      console.error("Error joining call", err);
    });

    return () => {
      co.leave().then(() => co.destroy());
    };
  }, [url, navigate]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = `UbuntuMeet-Recording-${new Date().toISOString()}.webm`;
        a.click();
        window.URL.revokeObjectURL(url);
        setIsRecording(false);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      alert("Could not start recording. Please ensure you grant screen sharing permissions.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  if (!callObject) return <div className="flex-1 flex items-center justify-center text-white bg-[#0D0D0D]">Joining meeting...</div>;

  return (
    <DailyProvider callObject={callObject}>
      <div className="flex-1 flex flex-col bg-[#0D0D0D] h-screen overflow-hidden">
        {/* Privacy Notice */}
        <div className="bg-[#1A6B3C]/20 border-b border-[#1A6B3C]/30 px-4 py-2 flex items-center justify-center gap-2 text-[#1A6B3C] text-sm font-medium">
          <ShieldAlert className="h-4 w-4" />
          This meeting is private. Nothing is stored on our servers.
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex relative overflow-hidden">
          {/* Video Grid or Whiteboard */}
          <div className="flex-1 relative">
            {showWhiteboard ? (
              <div className="absolute inset-0 bg-white">
                <Tldraw />
              </div>
            ) : (
              <VideoGrid />
            )}
          </div>

          {/* Sidebar (Participants/Chat placeholder) */}
          <div className="w-80 bg-[#111111] border-l border-white/10 hidden lg:flex flex-col">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-[#D4A017]" />
                Participants
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <ParticipantList />
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <ControlsBar 
          showWhiteboard={showWhiteboard} 
          setShowWhiteboard={setShowWhiteboard}
          isRecording={isRecording}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
        />
      </div>
    </DailyProvider>
  );
}

function VideoGrid() {
  const participantIds = useParticipantIds();
  const localParticipant = useLocalParticipant();

  if (!localParticipant) return null;

  return (
    <div className="absolute inset-0 p-4 grid gap-4" style={{
      gridTemplateColumns: `repeat(auto-fit, minmax(300px, 1fr))`,
      gridAutoRows: '1fr'
    }}>
      {participantIds.map(id => (
        <ParticipantVideo key={id} id={id} />
      ))}
    </div>
  );
}

function ParticipantVideo({ id }: { id: string }) {
  const videoState = useVideoTrack(id);
  const audioState = useAudioTrack(id);

  return (
    <div className="relative bg-gray-900 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
      {videoState.isOff ? (
        <div className="h-20 w-20 rounded-full bg-gray-800 flex items-center justify-center">
          <User className="h-10 w-10 text-gray-500" />
        </div>
      ) : (
        <DailyVideo sessionId={id} type="video" className="w-full h-full object-cover" />
      )}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-sm flex items-center gap-2">
        {audioState.isOff ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4 text-green-500" />}
        Participant {id.substring(0, 4)}
      </div>
    </div>
  );
}

function ParticipantList() {
  const participantIds = useParticipantIds();
  const localParticipant = useLocalParticipant();

  return (
    <div className="space-y-4">
      {participantIds.map(id => (
        <div key={id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">
                {id === localParticipant?.session_id ? "You" : `User ${id.substring(0, 4)}`}
              </p>
            </div>
          </div>
          {/* Co-host button placeholder */}
          {id !== localParticipant?.session_id && (
            <Button variant="ghost" size="sm" className="text-xs text-[#D4A017] hover:text-[#D4A017]/80 hover:bg-[#D4A017]/10">
              Make Co-host
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

function ControlsBar({ 
  showWhiteboard, 
  setShowWhiteboard,
  isRecording,
  onStartRecording,
  onStopRecording
}: { 
  showWhiteboard: boolean, 
  setShowWhiteboard: (v: boolean) => void,
  isRecording: boolean,
  onStartRecording: () => void,
  onStopRecording: () => void
}) {
  const localParticipant = useLocalParticipant();
  const callObject = useDaily();
  const navigate = useNavigate();
  const { isSharingScreen, startScreenShare, stopScreenShare } = useScreenShare();

  const toggleAudio = useCallback(() => {
    if (!callObject || !localParticipant) return;
    callObject.setLocalAudio(!localParticipant.audio);
  }, [callObject, localParticipant]);

  const toggleVideo = useCallback(() => {
    if (!callObject || !localParticipant) return;
    callObject.setLocalVideo(!localParticipant.video);
  }, [callObject, localParticipant]);

  const toggleScreenShare = () => {
    if (isSharingScreen) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  const handleLeave = () => {
    if (callObject) {
      callObject.leave();
    }
    navigate("/dashboard");
  };

  if (!localParticipant) return null;

  return (
    <div className="h-20 bg-[#111111] border-t border-white/10 flex items-center justify-center px-4 gap-4">
      <ControlButton 
        icon={localParticipant.audio ? <Mic /> : <MicOff className="text-red-500" />} 
        label={localParticipant.audio ? "Mute" : "Unmute"} 
        onClick={toggleAudio}
        active={!localParticipant.audio}
      />
      <ControlButton 
        icon={localParticipant.video ? <Video /> : <VideoOff className="text-red-500" />} 
        label={localParticipant.video ? "Stop Video" : "Start Video"} 
        onClick={toggleVideo}
        active={!localParticipant.video}
      />
      <div className="w-px h-8 bg-white/10 mx-2" />
      <ControlButton 
        icon={<MonitorUp />} 
        label={isSharingScreen ? "Stop Share" : "Share Screen"} 
        onClick={toggleScreenShare}
        active={isSharingScreen}
      />
      <ControlButton 
        icon={isRecording ? <Square className="text-red-500 fill-red-500" /> : <Circle className="text-red-500" />} 
        label={isRecording ? "Stop Rec" : "Record"} 
        onClick={isRecording ? onStopRecording : onStartRecording}
        active={isRecording}
      />
      <ControlButton 
        icon={<PenTool />} 
        label="Whiteboard" 
        onClick={() => setShowWhiteboard(!showWhiteboard)}
        active={showWhiteboard}
      />
      <div className="w-px h-8 bg-white/10 mx-2" />
      <Button 
        onClick={handleLeave}
        variant="danger" 
        className="h-12 px-6 rounded-xl font-semibold flex items-center gap-2"
      >
        <LogOut className="h-5 w-5" />
        Leave
      </Button>
    </div>
  );
}

function ControlButton({ icon, label, onClick, active }: { icon: React.ReactNode, label: string, onClick: () => void, active?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-colors ${
        active ? 'bg-white/10' : 'hover:bg-white/5'
      }`}
    >
      <div className="mb-1 text-gray-300">{icon}</div>
      <span className="text-[10px] font-medium text-gray-400">{label}</span>
    </button>
  );
}


