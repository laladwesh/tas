import mongoose from "mongoose";

/**
 * Cached connection. Next.js hot-reloads modules in dev, which would otherwise
 * open a new Mongo connection on every reload until the pool is exhausted.
 */
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as unknown as {
  _mongooseCache?: MongooseCache;
};

const cached: MongooseCache = globalForMongoose._mongooseCache ?? {
  conn: null,
  promise: null,
};
globalForMongoose._mongooseCache = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set (check your .env)");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset so the next call retries instead of reusing a rejected promise.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}
