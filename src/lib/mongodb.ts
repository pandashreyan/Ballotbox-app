
import { MongoClient } from 'mongodb';

// Build-safe fallbacks to prevent compile crashes in isolation (e.g. Vercel build containers)
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/placeholder';
const dbName = process.env.MONGODB_DB_NAME || 'placeholder';

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4 // Force IPv4
    });
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production (including Vercel build time)
  if (!process.env.MONGODB_URI) {
    // Return a mock placeholder promise during build time to allow Next.js trace compiler to pass flawlessly
    clientPromise = Promise.resolve(null as any);
  } else {
    client = new MongoClient(uri, {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4 // Force IPv4
    });
    clientPromise = client.connect();
  }
}

console.log('MongoDB URI from env:', process.env.MONGODB_URI ? 'Loaded' : 'Not Loaded (Build Placeholder)');
console.log('MongoDB DB Name from env:', process.env.MONGODB_DB_NAME || 'placeholder');

export default clientPromise;
export { dbName };
