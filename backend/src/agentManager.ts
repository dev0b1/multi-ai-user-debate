import { spawn } from "child_process";
import path from "path";

interface AgentConfig {
  room: string;
  token: string;
  livekitUrl: string;
  persona: string;
  topic: string;
  stance: string;
  turnDuration: number;
  numberOfTurns: number;
}

// Simple in-memory agent tracking
const activeAgents = new Map<string, AgentConfig>();

export function launchAgent(config: AgentConfig) {
  const { room, token, livekitUrl, persona, topic, stance, turnDuration, numberOfTurns } = config;
  
  // Check if agent is already running for this room
  if (activeAgents.has(room)) {
    console.log(`[AGENT] Agent already running for room: ${room}`);
    return;
  }

  // Store agent configuration
  activeAgents.set(room, config);
  
  console.log(`[AGENT] Launching Python debate agent for room: ${room}`);
  console.log(`[AGENT] Persona: ${persona}`);
  console.log(`[AGENT] Topic: ${topic}`);
  console.log(`[AGENT] Stance: ${stance}`);
  console.log(`[AGENT] Turn Duration: ${turnDuration} minutes`);
  console.log(`[AGENT] Number of Turns: ${numberOfTurns}`);

  // Map frontend persona IDs to backend persona names
  const personaMapping: { [key: string]: string } = {
    "socrates": "AI Socrates",
    "einstein": "AI Einstein", 
    "trump": "AI Trump",
    "shakespeare": "AI Shakespeare",
    "tesla": "AI Tesla",
    "churchill": "AI Churchill",
    "gandhi": "AI Gandhi",
    "jobs": "AI Steve Jobs"
  };

  const backendPersona = personaMapping[persona] || persona;

  // Prepare environment variables for the Python agent
  const env = {
    ...process.env,
    LIVEKIT_URL: livekitUrl,
    LIVEKIT_TOKEN: token,
    LIVEKIT_ROOM_NAME: room,
    ROOM_METADATA: JSON.stringify({
      topic,
      persona: backendPersona,
      stance,
      room,
      turn_duration_min: turnDuration,
      total_rounds: numberOfTurns,
      created_at: new Date().toISOString(),
    }),
  };

  // Path to the Python debate agent
  const agentScript = path.join(__dirname, "../debate_agent.py");
  
  console.log(`[AGENT] Spawning Python process: ${agentScript}`);
  console.log(`[AGENT] Environment variables set for room: ${room}`);

  // Spawn the Python debate agent process
  const agent = spawn("python", [agentScript], {
    env,
    stdio: "inherit", // This will show all output in the console
  });

  agent.on("close", (code) => {
    console.log(`[AGENT] debate_agent.py exited with code ${code} for room: ${room}`);
    activeAgents.delete(room);
  });

  agent.on("error", (err) => {
    console.error(`[AGENT] Failed to start debate agent for room ${room}:`, err);
    activeAgents.delete(room);
  });

  // Log process start
  console.log(`[AGENT] Debate agent process started for room: ${room} (PID: ${agent.pid})`);
}

export function getActiveAgents() {
  return Array.from(activeAgents.entries());
}

export function stopAgent(room: string) {
  if (activeAgents.has(room)) {
    activeAgents.delete(room);
    console.log(`[AGENT] Stopped agent for room: ${room}`);
    return true;
  }
  return false;
} 