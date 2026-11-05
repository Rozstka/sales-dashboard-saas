import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
writeFileSync('.env', `POSTGRES_PASSWORD=${randomBytes(24).toString('hex')}\nJWT_SECRET=${randomBytes(32).toString('hex')}\n`, {flag:'wx',mode:0o600});
console.log('Created .env; no secrets printed.');
