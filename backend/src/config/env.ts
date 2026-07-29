import dotenv from 'dotenv';
import { cleanEnv, str, port, url } from 'envalid';

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'development' }),
  PORT: port({ default: 5000 }),
  MONGO_URI: str(),
  JWT_SECRET: str(),
  CLIENT_URL: url({ default: 'http://localhost:5173' }),
});
