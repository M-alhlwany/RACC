const crypto = require('crypto');
const fs = require('fs');

const secret = crypto.randomBytes(64).toString('hex');

fs.appendFileSync('config.env', `\nJWT_SECRET=${secret}\n`);

console.log('✅ Secret added to config.env');
