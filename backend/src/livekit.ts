import { AccessToken } from "livekit-server-sdk";

export function generateToken({
  apiKey,
  apiSecret,
  room,
  identity,
  ttl = 2 * 60 * 60, // 2 hours
}: {
  apiKey: string;
  apiSecret: string;
  room: string;
  identity: string;
  ttl?: number;
}): string {
  const at = new AccessToken(apiKey, apiSecret, { identity });
  at.addGrant({
    roomJoin: true,
    room,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    canUpdateOwnMetadata: true,
  });
  
  // Set expiration time
  const now = Math.floor(Date.now() / 1000);
  at.ttl = ttl;
  
  return at.toJwt();
} 