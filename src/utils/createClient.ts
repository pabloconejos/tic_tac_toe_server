import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config();

export const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.AUTH_TOKEN,
});
