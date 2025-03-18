



import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://niranjansubhedar:434vlC4Ke8YcsTYY@cluster0.imwl2.mongodb.net/";

if (!MONGODB_URI) {
  throw new Error('❌ Please define the MONGODB_URI environment variable inside .env.local');
}

const dbConnect = async () => {
  if (mongoose.connection.readyState !== 0) {
    console.log('🚀 Using existing database connection');
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log('✅ Successfully connected to MongoDB');
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw new Error('MongoDB connection failed');
  }
};

export default dbConnect;
