import mongoose from 'mongoose';
import { env } from './env';

mongoose.set('strictQuery', true);

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalRef = globalThis as unknown as { __mongoose?: Cache };
const cache: Cache = (globalRef.__mongoose ??= { conn: null, promise: null });

/** Reuses one connection across warm serverless invocations. */
export async function connectDB() {
  if (cache.conn) return cache.conn;
  cache.promise ??= mongoose.connect(env.MONGODB_URI, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 8000,
  });
  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }
  return cache.conn;
}
