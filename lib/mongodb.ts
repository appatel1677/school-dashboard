import mongoose from 'mongoose';

// .env.local માંથી કનેક્શન સ્ટ્રિંગ મેળવવી
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('કૃપા કરીને .env.local ફાઇલમાં MONGODB_URI ઉમેરો.');
}

// Next.js ના Hot Reloading દરમિયાન વારંવાર કનેક્શન ન થાય તે માટે કેશિંગ (Caching)
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
  // જો કનેક્શન પહેલેથી જ હાજર હોય, તો તેને જ રિટર્ન કરો
  if (cached?.conn) {
    return cached.conn;
  }

  // જો પહેલેથી કનેક્ટ થઈ રહ્યું હોય, તો તે જ પ્રોમિસનો ઉપયોગ કરો
  if (!cached?.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
};