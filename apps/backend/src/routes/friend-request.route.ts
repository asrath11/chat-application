import express from 'express';
import { protect } from '../middleware/auth.middleware';
import {
  sendFriendRequest,
  getAllSentFriendRequests,
  respondToFriendRequest,
  getIncomingFriendRequests,
} from '../controllers/friend-request.contoller';

const router = express.Router();

// POST /friend-request         -> send a request
router.post('/', protect, sendFriendRequest);

// POST /friend-request/respond -> accept or reject a request
router.post('/respond', protect, respondToFriendRequest);

// GET /friend-request/sent     -> requests this user sent
router.get('/sent', protect, getAllSentFriendRequests);

// GET /friend-request/incoming -> requests this user received
router.get('/incoming', protect, getIncomingFriendRequests);

export default router;
