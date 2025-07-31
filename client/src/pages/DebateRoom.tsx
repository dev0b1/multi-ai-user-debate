import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { 
  LiveKitRoom, 
  Chat, 
  ParticipantTile, 
  useParticipants,
  useRoomContext,
  RoomAudioRenderer,
  ControlBar,
  TrackToggle,
  DisconnectButton
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { AIAvatar } from "@/components/AIAvatar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import clsx from "clsx";

interface VideoTilesProps {
  userName: string;
  aiPersona: {
    name: string;
    avatar: string;
    color: string;
  };
  userRole: string;
  aiRole: string;
}

function VideoTiles({ userName, aiPersona, userRole, aiRole }: VideoTilesProps) {
  const participants = useParticipants();
  
  return (
    <div className="w-full max-w-4xl mx-auto mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
      {participants.map((participant) => (
        <div key={participant.identity} className="flex flex-col items-center space-y-2">
          <div className="relative w-full aspect-video bg-gray-800 rounded-lg overflow-hidden">
            <ParticipantTile 
              participant={participant}
              className="w-full h-full"
            />
          </div>
          <div className="text-sm text-center font-medium text-white">
            {participant.identity === userName
              ? `You (${userRole})`
              : `${aiPersona.name} (${aiRole})`}
          </div>
        </div>
      ))}
    </div>
  );
}

interface ParticipantCardProps {
  name: string;
  avatar: string;
  color: string;
  role: string;
  isActive: boolean;
  isUser: boolean;
}

function ParticipantCard({ name, avatar, color, role, isActive, isUser }: ParticipantCardProps) {
  return (
    <div className={`flex flex-col items-center p-6 rounded-xl shadow-2xl transition-all duration-300 w-64 ${
      isUser 
        ? "bg-gradient-to-br from-blue-900 to-blue-700" 
        : "bg-gradient-to-br from-purple-900 to-purple-700"
    } ${
      isActive 
        ? "ring-4 ring-blue-400 scale-105" 
        : "ring-2 ring-gray-600"
    }`}>
      {isUser ? (
        <Avatar className="w-16 h-16 mb-2">
          <AvatarFallback className="text-xl font-bold">
            {name[0]}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className={clsx("mb-2 relative w-16 h-16", isActive && "animate-pulse border-4 border-green-400 rounded-full")}> 
          <div style={{ width: '100%', height: '100%' }}>
            <AIAvatar 
              name={name} 
              avatar={avatar} 
              color={color} 
              isActive={isActive}
            />
          </div>
        </div>
      )}
      <div className="text-xl font-bold text-white mb-1">{name}</div>
      <div className="text-sm text-blue-200 mb-2">{role}</div>
      {isActive && !isUser && (
        <div className="text-xs text-green-400 animate-pulse font-medium">
          Speaking...
        </div>
      )}
      {isActive && isUser && (
        <div className="text-xs text-blue-400 animate-pulse font-medium">
          Speaking...
        </div>
      )}
    </div>
  );
}

interface DebateTimerProps {
  currentTurn: string;
  timeLeft: number;
  onTimeUp: () => void;
}

function DebateTimer({ currentTurn, timeLeft, onTimeUp }: DebateTimerProps) {
  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp?.();
    }
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft <= 30;

  return (
    <div className="flex flex-col items-center mb-6 p-4 bg-black/30 rounded-lg backdrop-blur-sm">
      <div className="text-lg font-semibold text-blue-300 mb-2">
        {currentTurn === "user" ? "Your Turn" : "AI's Turn"}
      </div>
      <div className={`text-4xl font-bold transition-colors duration-300 ${
        isLowTime ? "text-red-400 animate-pulse" : "text-white"
      }`}>
        {minutes}:{seconds.toString().padStart(2, "0")}
      </div>
      {isLowTime && (
        <div className="text-sm text-red-400 mt-1 animate-bounce">
          Time running out!
        </div>
      )}
    </div>
  );
}

function DebateControls() {
  return (
    <div className="flex justify-center items-center space-x-4 mt-6 p-4 bg-black/30 rounded-lg backdrop-blur-sm">
      <TrackToggle 
        source={Track.Source.Microphone}
        aria-label="Toggle Microphone"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
      />
      <TrackToggle 
        source={Track.Source.Camera}
        aria-label="Toggle Camera"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
      />
      <DisconnectButton aria-label="End Debate" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
        End Debate
      </DisconnectButton>
    </div>
  );
}

const DebateRoom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const debateConfig = location.state;

  // Get turn duration from config or default to 2 minutes
  const turnDurationSeconds = (debateConfig?.turnDuration || 2) * 60;

  // Timer/turn state
  const [currentTurn, setCurrentTurn] = useState("user");
  const [timeLeft, setTimeLeft] = useState(turnDurationSeconds);
  const [isConnected, setIsConnected] = useState(false);

  // Timer countdown effect
  useEffect(() => {
    if (!isConnected || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Switch turns when time runs out
          setCurrentTurn(current => current === "user" ? "ai" : "user");
          return turnDurationSeconds; // Reset to configured duration
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isConnected, timeLeft, turnDurationSeconds]);

  const handleTimeUp = () => {
    setCurrentTurn(current => current === "user" ? "ai" : "user");
    setTimeLeft(turnDurationSeconds);
  };

  if (!debateConfig || !debateConfig.livekit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-2xl">Connecting to debate room...</div>
        </div>
      </div>
    );
  }

  const { url, token } = debateConfig.livekit;
  const aiPersona = debateConfig.selectedPersona || { 
    name: "AI Assistant", 
    avatar: "gpt", 
    color: "purple" 
  };
  const userName = debateConfig.user || "Participant";
  const userRole = debateConfig.stance === "pro" ? "Pro" : "Con";
  const aiRole = debateConfig.stance === "pro" ? "Con" : "Pro";
  const topic = debateConfig.topic || "Debate Topic";

  const userActive = currentTurn === "user";
  const aiActive = !userActive;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Back Button */}
      <Button
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 z-50 text-white hover:bg-white/10 backdrop-blur-sm border border-white/20"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Setup
      </Button>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
            {topic}
          </h1>
          <p className="text-lg text-gray-300">
            Structured debate between human and AI
          </p>
        </div>

        {/* Participants Cards */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-8">
          <ParticipantCard
            name={userName}
            avatar="human"
            color="blue"
            role={userRole}
            isActive={userActive}
            isUser={true}
          />
          <div className="hidden md:block text-4xl font-bold text-white/50">
            VS
          </div>
          <ParticipantCard
            name={aiPersona.name}
            avatar={aiPersona.avatar}
            color={aiPersona.color}
            role={aiRole}
            isActive={aiActive}
            isUser={false}
          />
        </div>

        {/* Timer */}
        <div className="flex justify-center mb-8">
          <DebateTimer 
            currentTurn={currentTurn} 
            timeLeft={timeLeft}
            onTimeUp={handleTimeUp}
          />
        </div>

        {/* LiveKit Room */}
        <div className="max-w-6xl mx-auto">
          <LiveKitRoom
            serverUrl={url}
            token={token}
            connect={true}
            audio={true}
            video={true}
            onConnected={() => {
              console.log("[DEBATE] Connected to LiveKit room");
              setIsConnected(true);
            }}
            onDisconnected={() => {
              console.log("[DEBATE] Disconnected from LiveKit room");
              setIsConnected(false);
              navigate("/");
            }}
            className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6"
          >
            {/* Audio renderer for proper audio playback */}
            <RoomAudioRenderer />
            
            {/* Video tiles */}
            <VideoTiles 
              userName={userName} 
              aiPersona={aiPersona} 
              userRole={userRole} 
              aiRole={aiRole} 
            />
            
            {/* Controls */}
            <DebateControls />
            
            {/* Chat */}
            <div className="mt-6 max-w-2xl mx-auto">
              <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-white/10 p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Chat</h3>
                <div className="h-64 text-white flex flex-col">
                  <Chat 
                    messageFormatter={(message) => {
                      if (
                        typeof message === "object" &&
                        message !== null &&
                        "sender" in message &&
                        "timestamp" in message
                      ) {
                        const msgObj = message as { sender: string; timestamp?: string };
                        const isUser = msgObj.sender === userName;
                        return {
                          ...msgObj,
                          className: isUser
                            ? "bg-blue-800/60 text-white rounded-lg p-2 my-1 self-end"
                            : "bg-purple-800/60 text-white rounded-lg p-2 my-1 self-start",
                          timestamp: msgObj.timestamp
                            ? new Date(msgObj.timestamp).toLocaleTimeString()
                            : undefined,
                        };
                      }
                      return { children: String(message ?? "") };
                    }}
                  />
                </div>
              </div>
            </div>
          </LiveKitRoom>
        </div>
      </div>
    </div>
  );
};

export default DebateRoom;