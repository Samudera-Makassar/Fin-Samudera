import { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../firebaseConfig';
import Logo from '../assets/images/logo-samudera.png'

function Navbar() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser({
                    name: currentUser.displayName || "Anonymous",
                    initials: getInitials(currentUser.displayName || "Anonymous"),
                });
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <nav className="bg-white h-16 flex justify-between items-center px-6 shadow fixed top-0 left-64 right-0 z-50">
            <img src={Logo} alt="Samudera Logo" className="h-8" />
            <div className="flex items-center space-x-4">
                {user ? (
                    <>
                        <span className="font-medium">{user.name}</span>
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">
                            {user.initials}
                        </div>
                    </>
                ) : (
                    <span>Please login</span>
                )}
            </div>
        </nav>
    );
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('');
}

export default Navbar;
