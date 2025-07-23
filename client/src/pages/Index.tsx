import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchLiveKitCredentials } from "@/lib/api";

const Index = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [turnDuration, setTurnDuration] = useState([3]);
  const [numberOfTurns, setNumberOfTurns] = useState([4]);
  const [selectedPersona, setSelectedPersona] = useState<string>("");
  const [stance, setStance] = useState<"pro" | "con" | "">("");

  // Famous AI personas to choose from
  const aiPersonas = [
    { id: "socrates", name: "Socrates", description: "Ancient Greek philosopher", avatar: "gpt", color: "blue" },
    { id: "einstein", name: "Einstein", description: "Theoretical physicist", avatar: "ai2", color: "purple" },
    { id: "trump", name: "Trump", description: "Former US President", avatar: "ai3", color: "green" },
    { id: "shakespeare", name: "Shakespeare", description: "English playwright", avatar: "gpt", color: "blue" },
    { id: "tesla", name: "Tesla", description: "Inventor and engineer", avatar: "ai2", color: "purple" },
    { id: "churchill", name: "Churchill", description: "British Prime Minister", avatar: "ai3", color: "green" },
    { id: "gandhi", name: "Gandhi", description: "Indian independence leader", avatar: "gpt", color: "blue" },
    { id: "jobs", name: "Steve Jobs", description: "Apple co-founder", avatar: "ai2", color: "purple" }
  ];

  // Remove selectedPersonas and handlePersonaToggle, replace with single selection logic

  const handlePersonaSelect = (personaId: string) => {
    setSelectedPersona(personaId === selectedPersona ? "" : personaId);
  };

  const handleJoinDebate = async () => {
    if (topic.trim() && selectedPersona && stance) {
      const personaData = aiPersonas.find(persona => persona.id === selectedPersona);
      try {
        const roomName = topic.replace(/\s+/g, "-").toLowerCase().slice(0, 20) || "main";
        const user = `human-${Math.random().toString(36).slice(2, 8)}`;
        // Send persona, topic, and stance to backend
        const livekit = await fetchLiveKitCredentials(roomName, user, topic, selectedPersona, stance);
        navigate("/debate", {
          state: {
            topic,
            turnDuration: turnDuration[0],
            numberOfTurns: numberOfTurns[0],
            selectedPersona: personaData,
            stance,
            livekit,
            user,
            room: roomName
          }
        });
      } catch (err) {
        console.error("Failed to start debate:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">AI Debate Arena</h1>
          <p className="text-gray-300 text-lg">Where minds meet and ideas clash</p>
        </div>

        {/* Main Settings Card */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-white text-2xl">Create Debate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Topic Input */}
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-white text-lg font-medium">
                Debate Topic
              </Label>
              <Input
                id="topic"
                placeholder="Enter your debate topic..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 h-12 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* AI Persona Selection - now single choice */}
            <div className="space-y-4">
              <Label className="text-white text-lg font-medium">
                Select AI Persona (1 required)
              </Label>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {aiPersonas.map((persona) => {
                  const isSelected = selectedPersona === persona.id;
                  return (
                    <div
                      key={persona.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 cursor-pointer'
                          : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50 cursor-pointer'
                      }`}
                      onClick={() => handlePersonaSelect(persona.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={false}
                        className="border-gray-400"
                        readOnly
                      />
                      <div className="flex-1">
                        <div className="text-white font-medium">{persona.name}</div>
                        <div className="text-gray-400 text-sm">{persona.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {!selectedPersona && (
                <p className="text-yellow-400 text-sm">
                  Please select one AI persona to debate with.
                </p>
              )}
            </div>

            {/* Stance Selection */}
            <div className="space-y-2">
              <Label className="text-white text-lg font-medium">Choose Your Stance</Label>
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant={stance === "pro" ? "default" : "outline"}
                  onClick={() => setStance("pro")}
                  className="flex-1"
                >
                  Pro
                </Button>
                <Button
                  type="button"
                  variant={stance === "con" ? "default" : "outline"}
                  onClick={() => setStance("con")}
                  className="flex-1"
                >
                  Con
                </Button>
              </div>
              {!stance && (
                <p className="text-yellow-400 text-sm">Please select your stance.</p>
              )}
            </div>

            {/* Settings Section */}
            <div className="space-y-6">
              <h3 className="text-white text-xl font-semibold">Debate Settings</h3>
              
              {/* Turn Duration */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-white font-medium">Turn Duration</Label>
                  <span className="text-blue-400 font-semibold">{turnDuration[0]} min</span>
                </div>
                <Slider
                  value={turnDuration}
                  onValueChange={setTurnDuration}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>1 min</span>
                  <span>10 min</span>
                </div>
              </div>

              {/* Number of Turns */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-white font-medium">Number of Turns</Label>
                  <span className="text-blue-400 font-semibold">{numberOfTurns[0]}</span>
                </div>
                <Slider
                  value={numberOfTurns}
                  onValueChange={setNumberOfTurns}
                  max={10}
                  min={2}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>2 turns</span>
                  <span>10 turns</span>
                </div>
              </div>
            </div>

            {/* Join Button */}
            <Button 
              onClick={handleJoinDebate}
              disabled={!topic.trim() || !selectedPersona || !stance}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Start Debate
              {selectedPersona && (
                <span className="ml-2 text-sm">
                  with 1 AI
                </span>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Create engaging debates with AI personalities
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
