import { Response } from 'express';
import User from '../models/User';
import ConnectionRequest from '../models/ConnectionRequest';
import Notification from '../models/Notification';
import { getIO } from '../socket';

// @desc    Get network suggestions (users you are not connected to)
// @route   GET /api/network/suggestions
export const getSuggestions = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Find users who are NOT:
        // 1. The current user
        // 2. Already in connections
        // 3. Have a pending request (sent or received)

        const pendingRequests = await ConnectionRequest.find({
            $or: [{ sender: userId }, { recipient: userId }]
        });

        const excludedIds = [
            userId,
            ...user.connections.map(id => id.toString()),
            ...pendingRequests.map(r => r.sender.toString()),
            ...pendingRequests.map(r => r.recipient.toString())
        ];

        const suggestions = await User.find({
            _id: { $nin: excludedIds }
        })
            .select('firstName lastName username avatar role bio headline')
            .limit(10);

        res.status(200).json(suggestions);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send connection request
// @route   POST /api/network/request
export const sendConnectionRequest = async (req: any, res: Response) => {
    try {
        const { recipientId } = req.body;
        const senderId = req.user.id;

        if (recipientId === senderId) {
            res.status(400).json({ message: 'Cannot connect with yourself' });
            return;
        }

        const existingRequest = await ConnectionRequest.findOne({
            $or: [
                { sender: senderId, recipient: recipientId },
                { sender: recipientId, recipient: senderId }
            ]
        });

        if (existingRequest) {
            res.status(400).json({ message: 'Request already exists or already connected' });
            return;
        }

        const request = await ConnectionRequest.create({
            sender: senderId,
            recipient: recipientId
        });

        // Notify recipient
        const notification = await Notification.create({
            recipient: recipientId,
            sender: senderId,
            type: 'follow', // using follow type for connection requests for now
            content: 'sent you a connection request'
        });

        const fullNotification = await notification.populate('sender', 'firstName lastName avatar');
        getIO().to(recipientId).emit('notification', fullNotification);

        res.status(201).json(request);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Accept connection request
// @route   PUT /api/network/request/:requestId/accept
export const acceptRequest = async (req: any, res: Response) => {
    try {
        const request = await ConnectionRequest.findById(req.params.requestId);

        if (!request || request.status !== 'pending') {
            res.status(404).json({ message: 'Request non-existent or already handled' });
            return;
        }

        if (request.recipient.toString() !== req.user.id) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        request.status = 'accepted';
        await request.save();

        // Update both users' connections
        await User.findByIdAndUpdate(request.sender, { $addToSet: { connections: request.recipient } });
        await User.findByIdAndUpdate(request.recipient, { $addToSet: { connections: request.sender } });

        // Notify sender
        const notification = await Notification.create({
            recipient: request.sender,
            sender: req.user.id,
            type: 'follow',
            content: 'accepted your connection request'
        });

        const fullNotification = await notification.populate('sender', 'firstName lastName avatar');
        getIO().to(request.sender.toString()).emit('notification', fullNotification);

        res.status(200).json({ message: 'Connection accepted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get pending invitations
// @route   GET /api/network/invitations
export const getInvitations = async (req: any, res: Response) => {
    try {
        const invitations = await ConnectionRequest.find({
            recipient: req.user.id,
            status: 'pending'
        }).populate('sender', 'firstName lastName username avatar role bio headline');

        res.status(200).json(invitations);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
