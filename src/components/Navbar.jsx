import React, { useState, useEffect } from 'react'
import { db } from '../firebaseConfig'
import { doc, getDoc } from 'firebase/firestore'
import Logo from '../assets/images/logo-samudera.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'

function Navbar({ toggleSidebar }) {
    const [user, setUser] = useState(null)

    useEffect(() => {
        const uid = localStorage.getItem('userUid')
        const fetchUserData = async () => {
            if (uid) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', uid))
                    if (userDoc.exists()) {
                        const userData = userDoc.data()
                        setUser({
                            name: userData.nama || 'Anonymous',
                            initials: getInitials(userData.nama || 'Anonymous')
                        })
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error)
                }
            }
        }

        fetchUserData()
    }, [])

    return (
        <nav className="bg-white h-16 flex justify-between items-center px-4 md:px-6 shadow fixed top-0 left-0 right-0 z-20 lg:left-60">
            <div className="flex items-center space-x-4">
                <button onClick={toggleSidebar} className="lg:hidden text-gray-600">
                    <FontAwesomeIcon icon={faBars} size="lg" />
                </button>
                <img src={Logo} alt="Samudera Logo" className="h-6 md:h-8" />
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
                {user ? (
                    <>
                        <span className="font-medium hidden sm:block">{user.name}</span>
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">
                            {user.initials}
                        </div>
                    </>
                ) : (
                    <span>Please login</span>
                )}
            </div>
        </nav>
    )
}

function getInitials(name) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
}

export default Navbar