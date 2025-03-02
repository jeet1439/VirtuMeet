import { Router } from 'express';
import { saveMeetingHistory, getMeetingHistory } from '../controllers/meetings.controllers.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = Router();


router.post("/history/save/:meetingId", verifyToken, saveMeetingHistory);
router.get('/history/:userId', verifyToken, getMeetingHistory);


export default router;