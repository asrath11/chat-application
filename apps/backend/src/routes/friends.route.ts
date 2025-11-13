import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { getFriends } from '../controllers/friends.contoller';

const router = express.Router();

// GET /friends -> get friends list
router.get('/', protect, getFriends);

export default router;
