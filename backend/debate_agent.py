# debate_agent.py
# Compatible with livekit-agents >= 1.0.x

import os, json, asyncio
from dotenv import load_dotenv

from livekit import agents
from livekit.agents import Agent, AgentSession, RoomInputOptions
from livekit.plugins import (
    openai,
    deepgram,
    cartesia,
    silero,
    noise_cancellation,
)
from livekit.plugins.turn_detector.multilingual import MultilingualModel

load_dotenv()

# ----------------------------------------------------------------------------
# Environment Configuration
# ----------------------------------------------------------------------------
STT_MODEL = os.getenv("STT_MODEL", "nova-3")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")
TTS_MODEL = os.getenv("TTS_MODEL", "sonic-2")

# OpenRouter configuration (optional)
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
USE_OPENROUTER = os.getenv("USE_OPENROUTER", "false").lower() == "true"

# Distinct voice IDs for each persona
VOICES = {
    "AI Socrates": os.getenv("VOICE_SOCRATES", "a2b37e34-0712-44c4-a2c9-222222222222"),
    "AI Einstein": os.getenv("VOICE_EINSTEIN", "b3c48f45-1823-55d5-b3d0-333333333333"),
    "AI Trump": os.getenv("VOICE_TRUMP", "c4d59g56-2934-66e6-c4e1-444444444444"),
    "AI Shakespeare": os.getenv("VOICE_SHAKESPEARE", "d5e60h67-3045-77f7-d5f2-555555555555"),
    "AI Tesla": os.getenv("VOICE_TESLA", "e6f71i78-4156-88g8-e6g3-666666666666"),
    "AI Churchill": os.getenv("VOICE_CHURCHILL", "f7g82j89-5267-99h9-f7h4-777777777777"),
    "AI Gandhi": os.getenv("VOICE_GANDHI", "g8h93k90-6378-00i0-g8i5-888888888888"),
    "AI Steve Jobs": os.getenv("VOICE_JOBS", "h9i04l01-7489-11j1-h9j6-999999999999"),
}

# Personas and their system prompts
PERSONAS = {
    "AI Socrates": "You are Socrates, the ancient Greek philosopher. Use the Socratic method to question assumptions and draw analogies from ancient Greece. Be wise, thoughtful, and always seek deeper understanding through questioning.",
    "AI Einstein": "You are Albert Einstein, the theoretical physicist. Speak with scientific precision, use analogies from physics and mathematics, and emphasize the importance of imagination and curiosity in discovery.",
    "AI Trump": "You are Donald Trump, former US President. Speak with confidence and directness, use simple language, make bold statements, and focus on practical solutions and American values.",
    "AI Shakespeare": "You are William Shakespeare, the English playwright. Use eloquent language, poetic expressions, and draw from your vast knowledge of human nature and dramatic storytelling.",
    "AI Tesla": "You are Nikola Tesla, the inventor and engineer. Focus on innovation, electricity, wireless technology, and the future of human progress through scientific advancement.",
    "AI Churchill": "You are Winston Churchill, the British Prime Minister. Speak with determination, use powerful rhetoric, emphasize courage and resilience, and draw from historical wisdom.",
    "AI Gandhi": "You are Mahatma Gandhi, the Indian independence leader. Emphasize peace, non-violence, truth, and the power of moral courage and spiritual strength.",
    "AI Steve Jobs": "You are Steve Jobs, Apple co-founder. Focus on innovation, design, user experience, and the intersection of technology and the humanities. Be visionary and inspiring.",
}

# ----------------------------------------------------------------------------
# Agent Classes
# ----------------------------------------------------------------------------

class PersonaAgent(Agent):
    def __init__(self, name: str, prompt: str):
        super().__init__(instructions=prompt)
        self.name = name

# ----------------------------------------------------------------------------
# Entrypoint Function
# ----------------------------------------------------------------------------

async def send_chat_message(session, text, sender="AI"):
    # Send a chat message to the room via LiveKit DataTrack
    try:
        # Use the standard LiveKit chat topic
        topic = "lk.chat"
        # The message format should be a JSON string with sender and text
        payload = json.dumps({"sender": sender, "message": text}).encode("utf-8")
        # session.room is the underlying Room object
        await session.room.local_participant.publish_data(payload, topic=topic, reliable=True)
        print(f"[Chat] Sent message: {text}")
    except Exception as e:
        print(f"[Chat] Failed to send message: {e}")

async def entrypoint(ctx: agents.JobContext):
    # 1️⃣ Metadata injected by the FastAPI backend
    meta = json.loads(os.getenv("ROOM_METADATA", "{}"))
    topic = meta.get("topic", "AI Debate")
    persona = meta.get("persona", "AI Socrates")
    user_stance = meta.get("stance", "pro")
    room_name = meta.get("room", ctx.room)
    turn_duration_min = meta.get("turn_duration_min", 3)
    total_rounds = meta.get("total_rounds", 4)

    # AI takes the opposite stance
    ai_stance = "con" if user_stance == "pro" else "pro"
    stance_str = {"pro": "in favor of", "con": "against"}

    # Convert minutes to seconds
    turn_duration_sec = turn_duration_min * 60

    print(f"Starting debate in room: {room_name}")
    print(f"Topic: {topic}")
    print(f"Persona: {persona}")
    print(f"User stance: {user_stance}, AI stance: {ai_stance}")
    print(f"Turn duration: {turn_duration_min} minutes ({turn_duration_sec} seconds)")
    print(f"Total rounds: {total_rounds}")

    # 2️⃣ Configure LLM plugin
    if USE_OPENROUTER and OPENROUTER_API_KEY:
        llm_plugin = openai.LLM(
            model="mistralai/mistral-small-3.2-24b-instruct:free",
            base_url="https://openrouter.ai/api/v1",
            api_key=OPENROUTER_API_KEY
        )
        print("Using OpenRouter LLM")
    else:
        llm_plugin = openai.LLM(model=LLM_MODEL)
        print(f"Using OpenAI LLM: {LLM_MODEL}")

    # 3️⃣ Create session for the single AI persona
    prompt = PERSONAS.get(persona, f"You are {persona}, an AI debater.")
    prompt = (
        f"{prompt}\n\n"
        f"You are participating in a debate about: '{topic}'.\n"
        f"Your assigned stance is: {stance_str[ai_stance]}.\n"
        f"The human participant will argue {stance_str[user_stance]}.\n"
        f"Stay in character, provide thoughtful arguments for your side, and respond to the human's points."
    )

    print(f"Creating session for {persona}")
    session = AgentSession(
        stt=deepgram.STT(model=STT_MODEL, language="multi"),
        llm=llm_plugin,
        tts=cartesia.TTS(model=TTS_MODEL, voice=VOICES.get(persona)),
        vad=silero.VAD.load(),
        #turn_detection=MultilingualModel(),
    )
    agent = PersonaAgent(name=persona, prompt=prompt)
    await session.start(
        room=room_name,
        agent=agent,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC()
        ),
    )
    print(f"Session created for {persona}")

    # 4️⃣ Media connected – let AI introduce itself
    print("Connecting to room...")
    await ctx.connect()
    print("Connected! Starting introduction...")
    intro_text = f"Introduce yourself as {agent.name}, state your assigned stance ({stance_str[ai_stance]}) on the topic: '{topic}', and invite the human to begin the debate."
    ai_intro = await session.generate_reply(instructions=intro_text)
    await send_chat_message(session, ai_intro, sender=persona)
    print("Introduction complete!")

    # 5️⃣ Debate loop: alternate turns for total_rounds (user/ai)
    print(f"Starting debate with {total_rounds} rounds...")
    for round_counter in range(total_rounds):
        print(f"Round {round_counter + 1}: AI's turn")
        ai_reply = await session.generate_reply()
        await send_chat_message(session, ai_reply, sender=persona)
        await asyncio.sleep(turn_duration_sec)
        print(f"Round {round_counter + 1}: Human's turn (waiting)")
        # Listen for user speech, transcribe, and send as chat
        user_text = await session.listen_and_transcribe()
        if user_text:
            await send_chat_message(session, user_text, sender="User")
        await asyncio.sleep(turn_duration_sec)

    # 6️⃣ Graceful shutdown
    print("Debate complete! Shutting down...")
    await session.close()
    print("Session closed.")

# ----------------------------------------------------------------------------
# Main execution
# ----------------------------------------------------------------------------

if __name__ == "__main__":
    agents.cli.run_app(
        agents.WorkerOptions(entrypoint_fnc=entrypoint)
    ) 