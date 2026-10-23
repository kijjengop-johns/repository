'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { randomBytes, scryptSync } = require('node:crypto');

function promptHidden(label) {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') {
    throw new Error('Run this setup command from an interactive terminal.');
  }

  return new Promise((resolve, reject) => {
    let value = '';
    const input = process.stdin;
    process.stdout.write(label);
    input.setRawMode(true);
    input.resume();

    function finish(error) {
      input.setRawMode(false);
      input.removeListener('data', onData);
      process.stdout.write('\n');
      if (error) reject(error);
      else resolve(value);
    }

    function onData(chunk) {
      for (const character of chunk.toString('utf8')) {
        if (character === '\u0003') {
          finish(new Error('Setup cancelled.'));
          return;
        }
        if (character === '\r' || character === '\n') {
          finish();
          return;
        }
        if (character === '\u007f' || character === '\b') {
          value = value.slice(0, -1);
          continue;
        }
        if (character >= ' ') value += character;
      }
    }

    input.on('data', onData);
  });
}

async function main() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    throw new Error('.env already exists. Keep it safe; remove it yourself before resetting admin credentials.');
  }

  const username = (await promptHidden('Admin username (letters, numbers, . _ @ -): ')).trim();
  if (!/^[a-zA-Z0-9._@-]{3,64}$/.test(username)) {
    throw new Error('Use a username of 3-64 letters, numbers, dots, underscores, @ signs, or hyphens.');
  }

  const password = await promptHidden('Admin password (at least 12 characters): ');
  const confirmation = await promptHidden('Confirm password: ');
  if (password.length < 12) throw new Error('Choose a password with at least 12 characters.');
  if (password !== confirmation) throw new Error('The passwords do not match.');

  const salt = randomBytes(16);
  const passwordHash = scryptSync(password, salt, 64);
  const lines = [
    `ADMIN_USERNAME=${username}`,
    `ADMIN_PASSWORD_SALT=${salt.toString('hex')}`,
    `ADMIN_PASSWORD_HASH=${passwordHash.toString('hex')}`,
    `SESSION_SECRET=${randomBytes(32).toString('hex')}`,
    'HOST=127.0.0.1',
    'PORT=3000',
    'NODE_ENV=development',
    ''
  ];

  fs.writeFileSync(envPath, lines.join('\n'), { flag: 'wx', mode: 0o600 });
  console.log('Admin credentials saved in the ignored .env file. Start the site with npm start.');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
