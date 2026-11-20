import mongoose from 'mongoose';

const DEFAULT_FALLBACK_URL =
  'mongodb+srv://swastimoni2024_db_user:JcWw29YRnfTjstyM@mess.dljvhqz.mongodb.net/hostel_mess?retryWrites=true&w=majority';

function getSanitizedMongoUri(): string {
  let uri = process.env.MONGO_URL || process.env.MONGODB_URI || DEFAULT_FALLBACK_URL;
  uri = uri.trim();
  // Clean up any accidental leading whitespace after password colon: "user: pass@" -> "user:pass@"
  uri = uri.replace(/:\s+/, ':');
  // If no db name is in path, default to hostel_mess
  if (uri.endsWith('.mongodb.net/')) {
    uri = uri + 'hostel_mess?retryWrites=true&w=majority';
  }
  return uri;
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and prevent connections growing exponentially in serverless functions.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = getSanitizedMongoUri();
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

export async function getDbStatus(): Promise<{
  connected: boolean;
  database?: string;
  host?: string;
  error?: string;
}> {
  try {
    const conn = await connectToDatabase();
    return {
      connected: conn.connection.readyState === 1,
      database: conn.connection.name || 'hostel_mess',
      host: conn.connection.host,
    };
  } catch (err: any) {
    return {
      connected: false,
      error: err.message,
    };
  }
}
