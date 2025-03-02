import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
export default function HistoryModal() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentUser?._id) return;

      setIsLoading(true);

      try {
        const res = await fetch(`/api/history/${currentUser._id}`);
        if (!res.ok) {
          console.error("Error fetching history");
          return;
        }
        const data = await res.json();
        setHistory(data);
      } catch (error) {
        console.error("Error fetching history", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [currentUser]);

  return (
    <div className="p-6 bg-customDark min-h-screen">
      {!currentUser ? (
        <>
        <p className="text-red-400 text-lg font-semibold">
          History is not available in guest mode
        </p>
        <Link to='/login'><span className="text-blue-600 hover:underline">Login here</span></Link>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4 text-stone-50">
            {currentUser.username}, your Meeting History
          </h2>

          {isLoading ? (
            <p className="text-slate-200">Loading...</p>
          ) : (
            <ul className="space-y-2 text-stone-200">
              {history.length > 0 ? (
                history.map((meet, index) => (
                  <li key={index} className="border-b py-2">
                    <p>
                      <strong>Meeting ID:</strong> {meet.meetingCode}
                    </p>
                    <p>
                      <strong>Date: </strong>
                      {new Date(meet.date).toLocaleString()}
                    </p>
                  </li>
                ))
              ) : (
                <p className="text-stone-200">No history available</p>
              )}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
