import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { generateToken } from "./livekit";
import { launchAgent, getActiveAgents } from "./agentManager";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

const LIVEKIT_URL = process.env.LIVEKIT_URL!;
const API_KEY = process.env.LIVEKIT_API_KEY!;
const API_SECRET = process.env.LIVEKIT_API_SECRET!;

interface JoinRequest {
  room: string;
  user?: string;
  topic: string;
  persona: string;
  stance: string;
  turnDuration?: number;
  numberOfTurns?: number;
}

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    activeAgents: getActiveAgents().length
  });
});

app.post("/join", async (req: Request<{}, {}, JoinRequest>, res: Response) => {
  try {
    const { room, user, topic, persona, stance, turnDuration = 3, numberOfTurns = 4 } = req.body;
    
    // Validate required fields
    if (!room || !topic || !persona || !stance) {
      return res.status(400).json({ 
        error: "Missing required fields: room, topic, persona, and stance are required" 
      });
    }

    const identity = user || `human-${Math.random().toString(36).slice(2, 8)}`;
    const token = await generateToken({
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      room,
      identity,
    });

    // Launch the agent
    launchAgent({
      room,
      token,
      livekitUrl: LIVEKIT_URL,
      persona,
      topic,
      stance,
      turnDuration,
      numberOfTurns,
    });

    res.json({ 
      url: LIVEKIT_URL, 
      token,
      room,
      identity,
      agent: {
        persona,
        topic,
        stance,
        turnDuration,
        numberOfTurns
      }
    });
  } catch (err) {
    console.error("Error in /join endpoint:", err);
    res.status(500).json({ error: "Failed to join room" });
  }
});

// Get active agents endpoint
app.get("/agents", (req: Request, res: Response) => {
  try {
    const agents = getActiveAgents();
    res.json({ agents });
  } catch (err) {
    console.error("Error in /agents endpoint:", err);
    res.status(500).json({ error: "Failed to get agents" });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🎯 Join endpoint: http://localhost:${PORT}/join`);
}); 