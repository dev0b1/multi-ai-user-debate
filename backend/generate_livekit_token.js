// generate_livekit_token.js
const { AccessToken } = require('livekit-server-sdk');
const args = process.argv.slice(2);

if (args.length < 5) {
  console.error('Usage: node generate_livekit_token.js <apiKey> <apiSecret> <room> <identity> <ttlSeconds>');
  process.exit(1);
}

const [apiKey, apiSecret, room, identity, ttlSeconds] = args;

async function main() {
  const at = new AccessToken(apiKey, apiSecret, { identity });
  at.addGrant({
    roomJoin: true,
    room,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    canUpdateOwnMetadata: true
  });

  // Set validUntil to now + ttlSeconds (in seconds)
  at.validUntil = Math.floor(Date.now() / 1000) + parseInt(ttlSeconds, 10);

  const token = await at.toJwt();
  console.log(token);
}

main(); 