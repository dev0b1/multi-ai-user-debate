# Multi-AI Debate App - Bolt Hackathon

A real-time multi-AI debate application built with React, TypeScript, Python, and LiveKit for the Bolt Hackathon.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- Python >= 3.8
- LiveKit server credentials

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

   This will:
   - Install Node.js dependencies for the monorepo
   - Install frontend dependencies
   - Install backend dependencies
   - Set up Python virtual environment and install Python dependencies

2. **Set up environment variables:**

   **Backend (`backend/.env`):**
   ```env
   LIVEKIT_URL=wss://your-livekit-host:443
   LIVEKIT_API_KEY=your_api_key
   LIVEKIT_API_SECRET=your_api_secret
   PORT=8000
   
   # Optional AI model configuration
   STT_MODEL=nova-3
   LLM_MODEL=gpt-4o-mini
   TTS_MODEL=sonic-2
   ```

   **Frontend (`client/.env`):**
   ```env
   VITE_BACKEND_URL=http://localhost:8000
   ```

3. **Run the entire application:**
   ```bash
   npm run dev
   ```

   This will start both:
   - Backend: http://localhost:8000 (TypeScript Express + Python agents)
   - Frontend: http://localhost:5173 (or similar Vite port)

## 📁 Project Structure

```
multi-ai-user-debates/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Main pages (Index, DebateRoom)
│   │   ├── components/    # UI components
│   │   └── lib/          # Utilities (API, LiveKit)
│   └── package.json
├── backend/               # Hybrid TypeScript + Python backend
│   ├── src/
│   │   ├── index.ts      # Main Express server
│   │   ├── livekit.ts    # LiveKit token generation
│   │   └── agentManager.ts # Agent orchestration
│   ├── debate_agent.py   # Python LiveKit agent (main debate logic)
│   ├── requirements.txt  # Python dependencies
│   ├── package.json      # Node.js dependencies
│   └── .env             # Backend environment variables
├── package.json          # Monorepo root
└── README.md
```

## 🎯 Features

- **Dynamic AI Personas**: Select from multiple AI personalities for debates
- **Real-time Audio**: LiveKit-powered voice communication
- **Topic-based Debates**: Start debates on any topic
- **Active Speaker Detection**: Visual indicators for who's speaking
- **Hybrid Backend**: TypeScript Express server + Python LiveKit agents
- **Advanced AI**: Speech-to-text, text-to-speech, and LLM integration

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run install:all` | Install all dependencies (Node.js + Python) |
| `npm run install:client` | Install only frontend dependencies |
| `npm run install:backend` | Install backend Node.js dependencies |
| `npm run create:venv` | Create Python virtual environment |
| `npm run install:python` | Install Python dependencies |
| `npm run dev` | Start both frontend and backend in development |
| `npm run dev:client` | Start only the frontend |
| `npm run dev:backend` | Start only the backend |
| `npm run build` | Build the frontend for production |
| `npm run build:backend` | Build the backend for production |
| `npm run start:backend` | Start the backend in production mode |

## 🔧 Development

### Frontend (React + Vite)
- Located in `client/`
- Uses LiveKit client v2.15.3
- Tailwind CSS for styling
- shadcn/ui components

### Backend (Hybrid TypeScript + Python)
- **TypeScript Express Server**: API endpoints, token generation, agent orchestration
- **Python LiveKit Agent**: `debate_agent.py` handles actual AI debate functionality
- **LiveKit Integration**: Real-time audio/video communication
- **AI Services**: Speech-to-text (Deepgram), text-to-speech (Cartesia), LLM (OpenAI/OpenRouter)

## 🎮 How to Use

1. Open the app in your browser
2. Enter a debate topic
3. Select an AI persona
4. Choose your stance (Pro/Con)
5. Configure debate settings
6. Click "Start Debate"
7. Allow microphone access when prompted
8. Participate in the live debate!

## 📝 Environment Variables

### Required for Backend
- `LIVEKIT_URL`: Your LiveKit server WebSocket URL
- `LIVEKIT_API_KEY`: LiveKit API key
- `LIVEKIT_API_SECRET`: LiveKit API secret
- `PORT`: Server port (default: 8000)

### Optional AI Configuration
- `STT_MODEL`: Speech-to-text model (default: nova-3)
- `LLM_MODEL`: Language model (default: gpt-4o-mini)
- `TTS_MODEL`: Text-to-speech model (default: sonic-2)
- `OPENROUTER_API_KEY`: OpenRouter API key (optional)
- `USE_OPENROUTER`: Use OpenRouter instead of OpenAI (default: false)

### Required for Frontend
- `VITE_BACKEND_URL`: Backend server URL (default: http://localhost:8000)

## 🚀 Deployment

### Frontend
```bash
npm run build
# Deploy the client/dist folder
```

### Backend
```bash
cd backend
npm run build
npm start
```

## 🤝 Contributing

This is a hackathon project. Feel free to fork and improve!

## 📄 License

MIT License - feel free to use for your own projects!
