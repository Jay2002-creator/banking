import dns from 'node:dns';
import mongoose from 'mongoose';

// Fix querySrv EBADRESP / ECONNREFUSED on local systems and mobile hotspots
if (typeof window === 'undefined' && process.env.NEXT_RUNTIME !== 'edge') {
  try {
    const setServers = dns.setServers || dns.default?.setServers;
    if (typeof setServers === 'function') {
      setServers(['8.8.8.8', '1.1.1.1']);
    }
  } catch (e) {
    console.warn('Could not set custom DNS servers for MongoDB resolution:', e);
  }
}

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DIRECT_URI = process.env.MONGODB_DIRECT_URI;

if (!MONGODB_URI && !MONGODB_DIRECT_URI) {
  throw new Error(
    'Please define the MONGODB_URI or MONGODB_DIRECT_URI environment variable inside your configuration or .env file'
  );
}

/**
 * Global cache is used here to maintain a cached connection across hot-reloads
 * in development. This prevents database connections from growing exponentially
 * during fast refreshes in development, and optimizes reuse in serverless environments.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB Database using Mongoose singleton instance.
 * @returns {Promise<typeof mongoose>}
 */
export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  const opts = {
    bufferCommands: false,
    // Optimized connection pool settings for serverless environments (Vercel)
    maxPoolSize: 10,
    minPoolSize: 2,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 45000,
  };

  const connectWithUri = (uri) =>
    mongoose.connect(uri, opts).then((mongooseInstance) => {
      // Register global event listeners for database connections
      mongoose.connection.on('connected', () => {
        console.log('MongoDB connection successfully established.');
      });

      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB connection disconnected.');
      });

      return mongooseInstance;
    });

  if (!cached.promise) {
    const primaryUri = MONGODB_URI || MONGODB_DIRECT_URI;
    cached.promise = connectWithUri(primaryUri).catch(async (error) => {
      const isSrvDnsFailure =
        error?.syscall === 'querySrv' ||
        (typeof error?.hostname === 'string' && error.hostname.startsWith('_mongodb._tcp.')) ||
        ['EBADRESP', 'ECONNREFUSED', 'ENOTFOUND', 'ETIMEOUT', 'ESERVFAIL', 'EREFUSED'].includes(error?.code) ||
        (typeof error?.message === 'string' && error.message.includes('querySrv'));

      if (!isSrvDnsFailure || !MONGODB_DIRECT_URI || primaryUri === MONGODB_DIRECT_URI) {
        throw error;
      }

      console.warn(
        'MongoDB SRV DNS lookup failed locally. Retrying with MONGODB_DIRECT_URI fallback.'
      );
      return connectWithUri(MONGODB_DIRECT_URI);
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('Failed to establish initial MongoDB connection:', e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
