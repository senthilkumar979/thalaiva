import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var -- global cache for HMR
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };
if (process.env.NODE_ENV !== "production") global.mongooseCache = cache;

export async function connectDb(): Promise<typeof mongoose> {
  if (!MONGODB_URI) throw new Error("MONGODB_URI is not set");
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }
  cache.conn = await cache.promise;
  const { seedFranchisesIfEmpty } = await import("@/lib/seedFranchises");
  await seedFranchisesIfEmpty();
  return cache.conn;
}

/**
 * Standalone `mongod` does not support multi-document transactions (MongoServerError code 20).
 * `startTransaction()` may succeed; the first command with the session can throw instead.
 */
export function isMongoTransactionUnsupportedError(e: unknown): boolean {
  let cur: unknown = e;
  for (let i = 0; i < 6 && cur; i++) {
    const err = cur as {
      code?: number;
      errorResponse?: { code?: number };
      message?: string;
      cause?: unknown;
    };
    const code = err.code ?? err.errorResponse?.code;
    if (code === 20) return true;
    if (
      typeof err.message === "string" &&
      err.message.includes("Transaction numbers are only allowed")
    ) {
      return true;
    }
    cur = err.cause;
  }
  return false;
}
