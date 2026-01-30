import { Response } from 'express';
import Message from '../models/Message';
import User from '../models/User';
import mongoose from 'mongoose';
import { getIO } from '../socket';

// @desc    Get list of conversations (people messaged)
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req: any, res: Response) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        console.log("getConversations for user:", userId);

        // This aggregation finds unique chat partners and their latest message
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: userId },
                        { recipient: userId }
                    ]
                }
            },
            {
                $sort: { _id: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$sender", userId] },
                            "$recipient",
                            "$sender"
                        ]
                    },
                    lastMessage: { $first: "$content" },
                    lastMessageDate: { $first: "$createdAt" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ["$recipient", userId] }, { $eq: ["$isRead", false] }] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    _id: 1,
                    lastMessage: 1,
                    lastMessageDate: 1,
                    unreadCount: 1,
                    'user._id': 1,
                    'user.firstName': 1,
                    'user.lastName': 1,
                    'user.username': 1,
                    'user.avatar': 1,
                    'user.role': 1
                }
            },
            { $sort: { lastMessageDate: -1 } }
        ]);
        console.log("Conversations found:", conversations.length);
        if (conversations.length > 0) {
            console.log("First conversation last message:", conversations[0].lastMessage, "Date:", conversations[0].lastMessageDate);
        }

        res.status(200).json(conversations);
    } catch (error: any) {
        console.error("Get Conversations Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get messages between current user and another user
// @route   GET /api/messages/:userId
// @access  Private
export const getMessages = async (req: any, res: Response) => {
    try {
        const partnerId = new mongoose.Types.ObjectId(req.params.userId);
        const currentUserId = new mongoose.Types.ObjectId(req.user.id);

        console.log(`Fetching messages between ${currentUserId} and ${partnerId}`);

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, recipient: partnerId },
                { sender: partnerId, recipient: currentUserId }
            ]
        }).sort({ createdAt: 1 });

        // Mark received messages as read
        await Message.updateMany(
            { sender: partnerId, recipient: currentUserId, isRead: false },
            { isRead: true }
        );

        res.status(200).json(messages);
    } catch (error: any) {
        console.error("Get Messages Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req: any, res: Response) => {
    try {
        const { recipientId, content } = req.body;
        const senderId = new mongoose.Types.ObjectId(req.user.id);
        const targetRecipientId = new mongoose.Types.ObjectId(recipientId);

        const message = await Message.create({
            sender: senderId,
            recipient: targetRecipientId,
            content
        });

        const fullMessage = await message.populate('sender', 'firstName lastName username avatar');

        // Emit to recipient's personal room
        const io = getIO();
        const targetRoom = String(recipientId);
        console.log(`Emitting messaging to room: ${targetRoom} from sender: ${senderId}`);
        io.to(targetRoom).emit('new_message', fullMessage);

        res.status(201).json(fullMessage);
    } catch (error: any) {
        console.error("Send Message Error:", error);
        res.status(500).json({ message: error.message });
    }
};
