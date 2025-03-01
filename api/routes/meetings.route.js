import { Router } from 'express';
import { saveMeetingHistory } from '../controllers/meetings.controllers.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = Router();

router.post("/save/:meetingId", verifyToken, saveMeetingHistory);

export default router;