import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LiveKitRoom, Chat, ParticipantTile, ParticipantLoop, useParticipants } from "@livekit/components-react";

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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with topic and round info */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">
          {debateConfig.topic || "Debate Topic"}
        </h1>
        <DebateTimer currentTurn={currentTurn} timeLeft={timeLeft} />
      </div>

      {/* LiveKit Room with Audio, Video, and Chat */}
      <div className="flex flex-col items-center justify-center w-full">
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

      {/* Back Button - Fixed Position */}
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
