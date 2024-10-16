import React, { useState } from 'react'
import LogoHero from '../assets/images/login-hero.png'
import Logo from '../assets/images/logo-samudera.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false)

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    return (
        <div className="flex h-screen">
            {/* Left Side (Hero Image) */}
            <div className="w-[65%] h-full">
                <img src={LogoHero} alt="Login Hero" className="w-full h-full object-cover" />
            </div>

            {/* Right Side (Login Form) */}
            <div className="w-[35%] bg-white flex flex-col justify-center px-16">
                <div className="mb-8">
                    <img src={Logo} alt="Logo" className="w-[234px] h-[36px]" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Login</h1>

                <div className="mb-6">
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="user@gmail.com"
                        className="w-full px-4 py-3 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>

                <div className="mb-8">
                    <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            className="w-full px-4 py-3 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <span
                            onClick={togglePasswordVisibility}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                        >
                            <FontAwesomeIcon
                                icon={showPassword ? faEyeSlash : faEye}
                                className="h-5 w-5 text-gray-500"
                            />
                        </span>
                    </div>
                </div>

                <button className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition duration-300">
                    Login
                </button>
            </div>
        </div>
    )
}

export default LoginPage
