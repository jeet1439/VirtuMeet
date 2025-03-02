import React from 'react'
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import  logo  from '../assets/logo.png';
import { signOutFailure, signOutSuccess } from '../redux/user/userSlice.js';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { currentUser } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const handleSignout = async () => {
      try{
         const res = await fetch('/api/v1/users/signout',{
          method: 'POST',
          credentials: "include"
         });
         const data = await res.json();
         if(!res.ok){
          console.log(data.message);
          dispatch(signOutFailure)
         }
         if(res.ok){
          dispatch( signOutSuccess());
         }
      }catch(error){
        console.log(error.message);
      }
    }

  return (
    <div>
      <nav>
        <div className='navHeader'>
        <Link to="/" className='self-center whitespace-nowrap  rounded-md'>
                <img src={logo} alt="Logo" className="w-32" />
            </Link>
        </div>
        <div className={`navList ${menuOpen ? 'open' : ''}`}>
          <p className='hover:text-orange-500'>Home</p>

          <Link to='/create-meet'><div role='button' ><p className='hover:text-orange-500'>Join as guest</p></div></Link>

          {
            (currentUser === null) ? (<Link to='/signup'>
              <p className='bg-gradient-to-r from-orange-500 to-red-800 rounded-md px-3 py-1 transition-all duration-300 hover:from-red-800 hover:to-orange-500'>Register</p>
              </Link>) : ( 
                <button onClick={handleSignout}><p className='hover:text-orange-500'>Logout</p></button>
              )
          }
          
        </div>
        <div className='hamburger' onClick={() => setMenuOpen(!menuOpen)}>
          <div className='bar'></div>
          <div className='bar'></div>
          <div className='bar'></div>
        </div>
      </nav>
    </div>
  )
}
