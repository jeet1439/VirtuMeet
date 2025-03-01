import React, { useEffect, useState} from "react";
import { useSelector } from 'react-redux';
export default function HistoryModal() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId , setUserId ] = useState("");

  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchHistory = async () => {
      setUserId(currentUser._id);
      setIsLoading(true);
      try {
        const res = await fetch(`/api/history/${userId}`);
        const data = await res.json();
        setHistory(data);
      } catch (error) {
        console.error("Error fetching history", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [userId]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
     
          <ul className="space-y-2">
            {history.length > 0 ? (
              history.map((meet, index) => (
                <li key={index} className="border-b py-2">
                  <p><strong>Meeting ID:</strong> {meet.meetingId}</p>
                  <p><strong>Date:</strong> {new Date(meet.timestamp).toLocaleString()}</p>
                </li>
              ))
            ) : (
              <p>No history available</p>
            )}
          </ul>
    </div>
  );
}
