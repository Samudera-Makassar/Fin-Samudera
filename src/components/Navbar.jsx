import React from 'react'
import { NavLink } from 'react-router-dom'
import Logo from '../assets/images/logo-samudera.png'

const Navbar = () => {
    return (
        <nav className="bg-white h-16 flex justify-between items-center px-6 shadow fixed top-0 left-64 right-0 z-50">
            <img src={Logo} alt="Samudera Logo" className="h-8" />
            <div className="flex items-center space-x-4">
                <span className="font-medium">Andi Ichwan</span>
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">AI</div>
            </div>
        </nav>
    )
}

export default Navbar
