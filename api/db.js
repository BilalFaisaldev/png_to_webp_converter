const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/png_to_webp_db';
const isVercel = !!process.env.VERCEL;

let cachedState = global.mongoState;

if (!cachedState) {
  cachedState = global.mongoState = { isConnected: false, isFallback: false, promise: null };
}

async function connectToDatabase() {
  if (cachedState.isConnected) {
    return { isMongo: true };
  }

  if (cachedState.isFallback) {
    return { isMongo: false };
  }

  // If running on Vercel and no cloud MongoDB URI is supplied, skip local mongodb attempt immediately
  if (isVercel && (MONGODB_URI.includes('127.0.0.1') || MONGODB_URI.includes('localhost'))) {
    console.warn('⚡ Vercel environment detected without Cloud MongoDB Atlas URI. Using local/memory fileDb fallback.');
    cachedState.isFallback = true;
    return { isMongo: false };
  }

  if (!cachedState.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2500
    };

    cachedState.promise = mongoose.connect(MONGODB_URI, opts).then(() => {
      console.log('✅ Successfully connected to MongoDB.');
      cachedState.isConnected = true;
      return { isMongo: true };
    }).catch((err) => {
      console.warn('⚠️ MongoDB connection failed. Falling back to fileDb.');
      cachedState.isFallback = true;
      cachedState.isConnected = false;
      return { isMongo: false };
    });
  }

  return await cachedState.promise;
}

module.exports = connectToDatabase;
