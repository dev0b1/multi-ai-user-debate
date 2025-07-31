import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LiveKitRoom, Chat, ParticipantTile, ParticipantLoop, useParticipants } from "@livekit/components-react";
import { AIAvatar } from "@/components/AIAvatar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function VideoTiles({ userName, aiPersona, userRole, aiRole }) {
  const participants = useParticipants();
  return (
    <div className="w-full max-w-2xl mx-auto mt-4 flex gap-4 justify-center">
      <ParticipantLoop participants={participants}>
        {(participant) => (
          <div className="flex flex-col items-center">
            <ParticipantTile participant={participant} />
            <div className="text-sm text-center mt-1">
              {participant.identity === userName
                ? `You (${userRole})`
                : `${aiPersona.name} (${aiRole})`}
            </div>
          </div>
        )}
      </ParticipantLoop>
    </div>
  );
}

function ParticipantCard({ name, avatar, color, role, isActive, isUser }) {
  return (
    <div className={`flex flex-col items-center p-4 rounded-xl shadow-xl bg-gradient-to-br ${isUser ? "from-blue-900 to-blue-700" : "from-purple-900 to-purple-700"} ${isActive ? "ring-4 ring-blue-400" : "ring-2 ring-gray-700"} transition-all duration-300 w-56`}>
      {isUser ? (
        <Avatar>
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
      ) : (
        <AIAvatar name={name} avatar={avatar} color={color} isActive={isActive} />
      )}
      <div className="mt-2 text-xl font-bold text-white">{name}</div>
      <div className="text-sm text-blue-200">{role}</div>
      {isActive && <div className="mt-1 text-xs text-blue-400 animate-pulse">Speaking...</div>}
    </div>
  );
}

function DebateTimer({ currentTurn, timeLeft }) {
  // Simple timer display, can be expanded with logic
  return (
    <div className="flex flex-col items-center mb-4">
      <div className="text-lg font-semibold text-blue-300">
        {currentTurn === "user" ? "Your Turn" : "AI's Turn"}
      </div>
      <div className="text-3xl font-bold text-white">
        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
      </div>
    </div>
  );
}

const DebateRoom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const debateConfig = location.state;

  // Timer/turn state (placeholder logic)
  const [currentTurn, setCurrentTurn] = useState("user");
  const [timeLeft, setTimeLeft] = useState(120); // 2 min per turn

  if (!debateConfig || !debateConfig.livekit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-2xl">Connecting to debate room...</div>
      </div>
    );
  }

  const { url, token } = debateConfig.livekit;
  const aiPersona = debateConfig.selectedPersona || { name: "AI", avatar: "gpt", color: "blue" };
  const userName = debateConfig.user || "You";
  const userRole = debateConfig.stance === "pro" ? "Pro" : "Con";
  const aiRole = debateConfig.stance === "pro" ? "Con" : "Pro";

  const userActive = currentTurn === "user";
  const aiActive = !userActive;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white flex flex-col">
      {/* Participants */}
      <div className="flex justify-center gap-8 mt-10">
        <ParticipantCard
          name={userName}
          avatar="human"
          color="blue"
          role={userRole}
          isActive={userActive}
          isUser={true}
        />
        <ParticipantCard
          name={aiPersona.name}
          avatar={aiPersona.avatar}
          color={aiPersona.color}
          role={aiRole}
          isActive={aiActive}
          isUser={false}
        />
      </div>

      {/* Topic and Timer */}
      <div className="text-center mt-8">
        <h1 className="text-4xl font-bold text-blue-300 mb-2">{debateConfig.topic || "Debate Topic"}</h1>
        <DebateTimer currentTurn={currentTurn} timeLeft={timeLeft} />
      </div>

      {/* Debate Area */}
      <div className="flex flex-col items-center justify-center w-full mt-6">
        <LiveKitRoom
          serverUrl={url}
          token={token}
          audio={true}
          video={true}
          style={{ width: "100%", maxWidth: 800, background: "#18181b", borderRadius: 12, padding: 24 }}
        >
          <VideoTiles userName={userName} aiPersona={aiPersona} userRole={userRole} aiRole={aiRole} />
          <div className="w-full max-w-2xl mx-auto mt-4">
            <Chat />
          </div>
        </LiveKitRoom>
      </div>

      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 text-white hover:bg-gray-700/50 p-2"
        size="sm"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
    </div>
  );
};

export default DebateRoom;
