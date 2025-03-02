import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import r3 from '../assets/r3.png';
import { RefreshCcw } from "lucide-react";
import { Link } from 'react-router-dom';
export default function SetMeeting() {

  let navigate = useNavigate();
  const [ meetingCode, setMeetingCode] = useState("");
  
  const generateCode = () => {
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase() ;
    setMeetingCode(randomCode);
  };

  let handleVideoCall = async () => {
    if (meetingCode.trim() !== "") {
      navigate(`/${meetingCode}`);
    }
  }
  
  return (
    <>
    <Navbar/>
    <div className="min-h-screen pt-20 bg-customDark flex flex-col md:flex-row justify-center px-6 md:px-12">
      <div className="md:w-1/2 text-white text-center md:text-left space-y-9">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Connect Seamlessly <br className="hidden md:block" /> Anytime, Anywhere
        </h1>
        <p className="text-lg text-gray-300 max-w-md mx-auto md:mx-0">
          Experience high-quality video calls and smooth messaging with our real-time communication platform.
        </p>
        <div className='flex gap-3'>
        <input type="text" className='border border-gray-600 bg-slate-800 text-stone-100 rounded-sm'  value={meetingCode} placeholder='generate code' onChange={(e) => setMeetingCode(e.target.value)}/> 
        <button onClick={handleVideoCall} className="bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded-md text-white transition">
          Get Started
        </button>
        <button onClick={generateCode}><RefreshCcw className='text-stone-200 '/></button>
        </div>
        <div className='mt-7'>
        <Link to='/show_meeting_history'><span className='text-blue-600 hover:underline'>Meeting History</span></Link>
        </div>
      </div>

      {/* Right Section - Image */}
      <div className="md:w-1/2 flex justify-center">
        <img
          src={r3}
          alt="Video Call Illustration"
          className="rounded-xl"
        />
      </div>
      
    </div>
    </>
  )
}
