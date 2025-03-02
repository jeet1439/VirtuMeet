import { Meeting } from "../models/meeting.model.js";

export const saveMeetingHistory = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId = req.user.userId; 

    if (!userId || !meetingId) {
      return res.status(400).json({ error: "Missing user ID or meeting ID" });
    }

    const meeting = new Meeting({
      user_id: userId, 
      meetingCode: meetingId, 
    });

    await meeting.save();

    res.status(201).json({ message: "History saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save history" });
  }
};

export const getMeetingHistory = async (req, res) => {
    const userId = req.params.userId;
  
    try {
      const history = await Meeting.find({ user_id: userId });
  
      if (!history || history.length === 0) {
        return res.status(404).json({ message: "No history found for this user" });
      }
  
      res.status(200).json(history);
    } catch (error) {
      res.status(500).json({ message: `Failed to fetch history: ${error.message}` });
    }
  };