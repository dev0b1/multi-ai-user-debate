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
    room,
    can_publish: true,
    can_subscribe: true,
    can_publish_data: true,
    can_publish_sources: ['audio'],
  });
  at.ttl = parseInt(ttlSeconds, 10);

  const token = await at.toJwt();
  console.log(token);
}

main(); 