import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import LogoHero from '../assets/images/login-hero.png';
import Logo from '../assets/images/logo-samudera.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userEmail = userCredential.user.email;
    
            const userDoc = await getDoc(doc(db, 'users', userEmail));
            const userData = userDoc.data();
    
            if (userData && userData.role) {
                const role = userData.role;
                localStorage.setItem('userRole', role);
    
                // Navigasi langsung tanpa ProtectedRoute
                if (role === 'admin') navigate('/dashboard/admin');
                else if (role === 'reviewer') navigate('/dashboard/reviewer');
                else if (role === 'employee') navigate('/dashboard/employee');
            } else {
                throw new Error("User role not defined");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Failed to login: " + err.message);
        }
    };

    return (
        <div className="flex h-screen">
            <div className="w-[65%] h-full">
                <img src={LogoHero} alt="Login Hero" className="w-full h-full object-cover" />
            </div>

            <div className="w-[35%] bg-white flex flex-col justify-center px-16">
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
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
