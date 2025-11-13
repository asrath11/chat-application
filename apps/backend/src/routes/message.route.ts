import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { sendMessageSchema } from '../schemas/message.schema';
import {
  sendMessage,
  getMessages,
  getUnreadCount,
} from '../controllers/message.controller';

const router = express.Router();

// POST /messages -> send a message
router.post('/', protect, validate(sendMessageSchema), sendMessage);

// GET /messages/:friendId -> get messages with a friend
router.get('/:friendId', protect, getMessages);

// GET /messages/unread/count -> get unread message count
router.get('/unread/count', protect, getUnreadCount);

export default router;
