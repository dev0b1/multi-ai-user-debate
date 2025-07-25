export async function fetchLiveKitCredentials(room: string, user: string, topic: string, persona: string, stance: string) {
  // Use a relative URL so Vite's proxy works in dev
  const response = await fetch('/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ room, user, topic, persona, stance }),
  });
  if (!response.ok) throw new Error('Failed to fetch LiveKit credentials');
  return response.json();
} 