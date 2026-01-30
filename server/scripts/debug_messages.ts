
import mongoose from 'mongoose';
import Message from '../src/models/Message';
import User from '../src/models/User';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skulmogulz');
        console.log('Connected to DB');

        const sophia = await User.findOne({ firstName: 'Sophia', lastName: 'Myers' });
        if (!sophia) {
            console.log('Sophia not found');
            return;
        }
        console.log('Sophia ID:', sophia._id);

        // Find messages involving Sophia
        const messages = await Message.find({
            $or: [{ sender: sophia._id }, { recipient: sophia._id }]
        }).sort({ createdAt: -1 }).limit(10).populate('sender', 'firstName').populate('recipient', 'firstName');

        console.log('Recent messages involving Sophia:');
        messages.forEach(m => {
            console.log(`
                ID: ${m._id}
                From: ${(m.sender as any).firstName}
                To: ${(m.recipient as any).firstName}
                Content: ${m.content}
                CreatedAt: ${m.createdAt} (Timestamp: ${new Date(m.createdAt).getTime()})
            `);
        });

        // Run the aggregation logic manually to see what it picks
        const aggregation = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: sophia._id }, // Simulate usage from Sophia's perspective (or the other user)
                        { recipient: sophia._id }
                    ]
                }
            },
            { $sort: { createdAt: 1 } },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$sender", sophia._id] },
                            "$recipient",
                            "$sender"
                        ]
                    },
                    lastMessage: { $last: "$content" },
                    lastMessageDate: { $last: "$createdAt" },
                    count: { $sum: 1 }
                }
            }
        ]);

        console.log('Aggregation result (from Sophia perspective):');
        console.log(JSON.stringify(aggregation, null, 2));

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
