import { Meeting } from "../models/meeting.model.js";

export const saveMeetingHistory = async (req, res) => {
    console.log(req.user);
    try {
      const { meetingId } = req.params;
      const userId = req.user.userId;    

    //   console.log(meetingId);
    //   console.log(userId);

      if (!userId || !meetingId) {
        return res.status(400).json({ error: "Missing user ID or meeting ID" });
      }
  
      const history = new Meeting({
        user_Id: userId,
        meetingCode: meetingId
      });
  
      await history.save();
      res.status(201).json({ message: "History saved successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to save history" });
    }
  };

