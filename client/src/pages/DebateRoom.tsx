import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LiveKitRoom, Chat, ParticipantTile, ParticipantLoop, useParticipants } from "@livekit/components-react";

const DebateRoom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const debateConfig = location.state;

  // Get the list of participants from the LiveKit context
  const participants = useParticipants();

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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with topic and round info */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">
          {debateConfig.topic || "Debate Topic"}
        </h1>
        {/* You can add round/turn info here if needed */}
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
          {/* Video/Audio Tiles */}
          <div className="w-full max-w-2xl mx-auto mt-4">
            <ParticipantLoop participants={participants}>
              <ParticipantTile />
            </ParticipantLoop>
          </div>
          {/* Chat UI */}
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
