import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skulmogulz', {
            serverSelectionTimeoutMS: 5000, // 5 seconds timeout
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        // Don't exit process in dev, just log it so we can see other errors
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
};

export default connectDB;
