import React, { useState } from 'react'
import { db } from '../firebaseConfig'
import { doc, getDocs, where, query, collection } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import LogoHero from '../assets/images/login-hero.jpg'
import Logo from '../assets/images/logo-samudera.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash, faSpinner } from '@fortawesome/free-solid-svg-icons'

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            // Query untuk memeriksa email
            const emailQuery = query(collection(db, 'users'), where('email', '==', email));
            const emailSnapshot = await getDocs(emailQuery);

            if (emailSnapshot.empty) {
                setError('Email tidak ditemukan');
                setIsLoading(false);
                return;
            }

            // Query untuk memeriksa password
            const userQuery = query(
                collection(db, 'users'),
                where('email', '==', email),
                where('password', '==', password)
            );
            const userSnapshot = await getDocs(userQuery);

            if (userSnapshot.empty) {
                setError('Password Salah');
                setIsLoading(false);
                return;
            }

            // Ambil data user dan lakukan navigasi
            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();

            const role = userData.role;
            localStorage.setItem('userRole', role);
            localStorage.setItem('userUid', userDoc.id);

            // Navigasi ke dashboard sesuai role
            if (role === 'Admin') navigate('/dashboard/admin');
            else if (role === 'Validator') navigate('/dashboard/validator');
            else if (role === 'Reviewer') navigate('/dashboard/reviewer');
            else if (role === 'Employee') navigate('/dashboard/employee');
            else if (role === 'Super Admin') navigate('/manage-users');
            else {
                setError('Role tidak dikenali. Hubungi administrator.');
                setIsLoading(false);
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Terjadi kesalahan saat login. Silakan coba lagi.');
            setIsLoading(false);
        }
    }

    return (
        <div className="flex h-screen flex-col lg:flex-row">
            {/* Logo Hero */}
            <div className="w-full lg:w-[65%] h-full relative">
                <img src={LogoHero} alt="Login Hero" className="w-full h-full object-cover" />

                {/* Form overlay untuk smartphone/tablet */}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center lg:hidden">
                    <div className="bg-white p-4 sm:p-6 rounded-lg w-11/12 max-w-sm sm:max-w-md shadow-lg">
                        <div className="mb-6 sm:mb-8 text-center">
                            <img src={Logo} alt="Logo" className="w-5/12 sm:w-6/12 mx-auto" />
                        </div>

                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">Login</h1>

                        {error && <p className="text-red-500 mb-4 text-center text-sm sm:text-base">{error}</p>}

                        <form onSubmit={handleLogin}>
                            <div className="mb-4 sm:mb-6">
                                <label
                                    htmlFor="email"
                                    className="block text-gray-700 font-medium mb-2 text-sm sm:text-base"
                                >
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="user@gmail.com"
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                                />
                            </div>

                            <div className="mb-6 sm:mb-8">
                                <label
                                    htmlFor="password"
                                    className="block text-gray-700 font-medium mb-2 text-sm sm:text-base"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                                    />
                                    <span
                                        onClick={togglePasswordVisibility}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                    >
                                        <FontAwesomeIcon
                                            icon={showPassword ? faEyeSlash : faEye}
                                            className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500"
                                        />
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-red-600 text-white font-semibold py-2 sm:py-3 rounded-md hover:bg-red-700 transition duration-300 text-sm sm:text-base"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    'Login'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Form login untuk desktop */}
            <div className="hidden lg:flex lg:w-[35%] bg-white flex-col justify-center px-16">
                <div className="mb-8">
                    <img src={Logo} alt="Logo" className="w-8/12 h-full" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Login</h1>

                {error && <p className="text-red-500 mb-4">{error}</p>}

                <form onSubmit={handleLogin}>
                    <div className="mb-6">
                        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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

                    <button
                        type="submit"
                        className="w-full bg-red-600 text-white font-semibold py-3 rounded-md hover:bg-red-700 transition duration-300"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default LoginPage
