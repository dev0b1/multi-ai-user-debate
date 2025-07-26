# Multi-AI Debate Backend (TypeScript + Python)

A hybrid backend for the Multi-AI Debate application with TypeScript Express server and Python LiveKit agents.

## Architecture

- **TypeScript Express Server**: Handles API endpoints, token generation, and agent orchestration
- **Python LiveKit Agent**: `debate_agent.py` handles the actual AI debate functionality with speech, LLM, and TTS

## Setup

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Set up Python environment:**
   ```bash
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # Windows:
   venv\Scripts\activate
   # Linux/Mac:
   source venv/bin/activate
   
   # Install Python dependencies
   pip install -r requirements.txt
   ```

3. **Environment Variables:**
   Create a `.env` file in the backend directory with:
   ```env
   # LiveKit Configuration
   LIVEKIT_URL=wss://your-livekit-host:443
   LIVEKIT_API_KEY=your_api_key_here
   LIVEKIT_API_SECRET=your_api_secret_here
   PORT=8000
   
   # AI Models (optional - will use defaults)
   STT_MODEL=nova-3
   LLM_MODEL=gpt-4o-mini
   TTS_MODEL=sonic-2
   
   # OpenRouter (optional)
   OPENROUTER_API_KEY=your_openrouter_key
   USE_OPENROUTER=false
   
   # Voice IDs for personas (optional)
   VOICE_SOCRATES=a2b37e34-0712-44c4-a2c9-222222222222
   VOICE_EINSTEIN=b3c48f45-1823-55d5-b3d0-333333333333
   VOICE_TRUMP=c4d59g56-2934-66e6-c4e1-444444444444
   VOICE_SHAKESPEARE=d5e60h67-3045-77f7-d5f2-555555555555
   VOICE_TESLA=e6f71i78-4156-88g8-e6g3-666666666666
   VOICE_CHURCHILL=f7g82j89-5267-99h9-f7h4-777777777777
   VOICE_GANDHI=g8h93k90-6378-00i0-g8i5-888888888888
   VOICE_JOBS=h9i04l01-7489-11j1-h9j6-999999999999
   ```

4. **Development:**
   ```bash
   npm run dev
   ```

5. **Build:**
   ```bash
   npm run build
   ```

6. **Production:**
   ```bash
   npm start
   ```

## API Endpoints

- `GET /health` - Health check
- `POST /join` - Join a debate room (starts Python agent)
- `GET /agents` - Get active agents

## Join Request Format

```json
{
  "room": "debate-room-name",
  "user": "optional-user-id",
  "topic": "Debate topic",
  "persona": "socrates",
  "stance": "pro",
  "turnDuration": 3,
  "numberOfTurns": 4
}
```

## Response Format

```json
{
  "url": "wss://your-livekit-host:443",
  "token": "livekit-jwt-token",
  "room": "debate-room-name",
  "identity": "user-id",
  "agent": {
    "persona": "AI Socrates",
    "topic": "Debate topic",
    "stance": "pro",
    "turnDuration": 3,
    "numberOfTurns": 4
  }
}
```

## How It Works

1. **Frontend Request**: Client calls `/join` with topic, persona, and settings
2. **Token Generation**: TypeScript backend generates LiveKit token
3. **Agent Launch**: TypeScript backend spawns Python `debate_agent.py` process
4. **Environment Setup**: Python agent receives configuration via environment variables
5. **Debate Execution**: Python agent connects to LiveKit room and runs the debate
6. **Real-time Communication**: Agent handles speech, LLM responses, and TTS

## Python Agent Features

- **LiveKit Agents Framework**: Full integration with LiveKit
- **Speech-to-Text**: Deepgram for real-time transcription
- **Text-to-Speech**: Cartesia for natural AI voices
- **Voice Activity Detection**: Silero for detecting when users speak
- **LLM Integration**: OpenAI or OpenRouter for AI responses
- **Multiple Personas**: 8 distinct AI personalities with unique voices
- **Structured Debates**: Timed turns and structured debate flow

## Persona Mapping

| Frontend ID | Backend Name | Description |
|-------------|--------------|-------------|
| `socrates` | AI Socrates | Ancient Greek philosopher |
| `einstein` | AI Einstein | Theoretical physicist |
| `trump` | AI Trump | Former US President |
| `shakespeare` | AI Shakespeare | English playwright |
| `tesla` | AI Tesla | Inventor and engineer |
| `churchill` | AI Churchill | British Prime Minister |
| `gandhi` | AI Gandhi | Indian independence leader |
| `jobs` | AI Steve Jobs | Apple co-founder | 