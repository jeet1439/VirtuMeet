import React from 'react'
import { FaVideo, FaDesktop, FaComments, FaShieldAlt } from 'react-icons/fa'
import { Link } from 'react-router-dom'
export default function Hero() {
  return (
    <div className="flex flex-col items-center main-container">
      <h1 className='text-4xl sm:text-3xl lg:text-7xl text-center tracking-wide mt-5 md:text-6xl font-bold text-stone-200'>
        Welcome to 
        <span className='bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text'>
            {" "}
            Virtuemeet
        </span>
      </h1>
      <p className='mt-10 text-lg text-center text-stone-500 max-w-4xl'>
      A real-time video calling app with seamless connectivity, high-quality video, low latency, real time chatting features for an enhanced user experience. 🚀
      </p>
      <div className='flex justify-center my-10'>
        <a href="#" className='bg-gradient-to-r from-orange-500 to-red-800 py-3 px-4 mx-3 rounded-md font-semibold text-stone-200 transition-all duration-300 hover:from-red-800 hover:to-orange-500'>
            Get started
        </a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-3 max-w-6xl mx-auto">
  <div className="flex flex-col items-center py-6 px-8 rounded-xl text-white shadow-2xl">
    <FaVideo className="text-5xl mb-4 text-orange-500" />
    <h3 className="text-lg">Create Meeting</h3>
  </div>
  
  <div className="flex flex-col items-center  py-6 px-8 rounded-xl text-white shadow-2xl">
    <FaDesktop className="text-5xl mb-4 text-orange-600" />
    <h3 className="text-lg">Screen Share</h3>
  </div>

  <div className="flex flex-col items-center  py-6 px-8 rounded-xl text-white shadow-2xl">
    <FaComments className="text-5xl mb-4 text-orange-500" />
    <h3 className="text-lg">Real-time Chat</h3>
  </div>

  <div className="flex flex-col items-center py-6 px-8 rounded-xl text-white shadow-2xl ">
    <FaShieldAlt className="text-5xl mb-4 text-orange-600" />
    <h3 className="text-lg">Security</h3>
  </div>
</div>
   <Link  to="https://github.com/jeet1439" target='_blank'>
    <div className='flex justify-center my-10'>
        <h3 className='text-md bg-gradient-to-r from-orange-500 to-red-800 px-5 py-2 rounded-md text-stone-200 '>Made by Jeet_banik</h3>
    </div>
    </Link>
    </div>
  )
}
