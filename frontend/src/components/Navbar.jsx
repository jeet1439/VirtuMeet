import React from 'react'
import { useState } from 'react';
import { Link } from 'react-router-dom';

import  logo  from '../assets/logo.png';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
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
          <div role='button' ><p className='hover:text-orange-500'>Join as guest</p></div>
          <Link to='/signup'>
          <p className='bg-gradient-to-r from-orange-500 to-red-800 rounded-md px-3 py-1 transition-all duration-300 hover:from-red-800 hover:to-orange-500'>Register</p>
          </Link>
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
