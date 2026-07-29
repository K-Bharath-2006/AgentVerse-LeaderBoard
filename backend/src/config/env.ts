import path from 'path';
import dotenv from 'dotenv';
import { cleanEnv, str, port, url } from 'envalid';

// Load from current working directory first, fallback to script directory root
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'development' }),
  PORT: port({ default: 5000 }),
  MONGO_URI: str(),
  JWT_SECRET: str(),
  CLIENT_URL: url({ default: 'http://localhost:5173' }),
});
