import React from 'react'
import { NavLink } from 'react-router-dom'

const Sidebar = ({ role }) => {
    if (!role) {
        return null; // Atau Anda bisa menampilkan loading state atau pesan error
    }
    
    return (
        <div>
            <aside className="fixed top-0 left-0 h-screen w-64 bg-[#ED1C24] pt-16">
                <ul className="w-full text-left">
                    <li>
                        <NavLink
                            to={`/dashboard/${role}`}
                            className={({ isActive }) =>
                                isActive
                                    ? 'block w-full py-2 pl-8 text-white bg-[#FF5B5F]'
                                    : 'block w-full py-2 pl-8 text-white hover:bg-[#FF5B5F]'
                            }
                        >
                            Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <hr className="border-red-500" /> 
                        {/* Menu Reimbursement */}
                        <span className="block w-full py-2 pl-4 text-gray-100 text-xs font-semibold cursor-default">
                            REIMBURSEMENT
                        </span>
                        <NavLink
                            to="/reimbursement/medical"
                            className={({ isActive }) =>
                                isActive
                                    ? 'block w-full py-2 pl-8 text-white bg-[#FF5B5F]'
                                    : 'block w-full py-2 pl-8 text-white hover:bg-[#FF5B5F]'
                            }
                        >
                            Medical
                        </NavLink>
                        <NavLink
                            to="/reimbursement/bbm"
                            className={({ isActive }) =>
                                isActive
                                    ? 'block w-full py-2 pl-8 text-white bg-[#FF5B5F]'
                                    : 'block w-full py-2 pl-8 text-white hover:bg-[#FF5B5F]'
                            }
                        >
                            BBM
                        </NavLink>
                        <NavLink
                            to="/reimbursement/operasional"
                            className={({ isActive }) =>
                                isActive
                                    ? 'block w-full py-2 pl-8 text-white bg-[#FF5B5F]'
                                    : 'block w-full py-2 pl-8 text-white hover:bg-[#FF5B5F]'
                            }
                        >
                            Operasional
                        </NavLink>
                        <NavLink
                            to="/reimbursement/umum"
                            className={({ isActive }) =>
                                isActive
                                    ? 'block w-full py-2 pl-8 text-white bg-[#FF5B5F]'
                                    : 'block w-full py-2 pl-8 text-white hover:bg-[#FF5B5F]'
                            }
                        >
                            GA/Umum
                        </NavLink>
                    </li>
                    {(role === 'reviewer' || role === 'admin') && (
                    <li>
                        <NavLink
                            to="/reimbursement/cek-laporan"
                            className={({ isActive }) =>
                                isActive
                                    ? 'block w-full py-2 pl-8 text-white bg-[#FF5B5F]'
                                    : 'block w-full py-2 pl-8 text-white hover:bg-[#FF5B5F]'
                            }
                        >
                            Cek Laporan
                        </NavLink>
                    </li>
                    )}
                    <li>
                        <hr className="border-red-500" /> 
                        {/* Menu LPJ Bon Sementara */}
                        <span className="block w-full py-2 pl-4 text-gray-100 text-xs font-semibold cursor-default">
                            LPJ BON SEMENTARA
                        </span>
                        <NavLink
                            to="/lpj/umum"
                            className={({ isActive }) =>
                                isActive
                                    ? 'block w-full py-2 pl-8 text-white bg-[#FF5B5F]'
                                    : 'block w-full py-2 pl-8 text-white hover:bg-[#FF5B5F]'
                            }
                        >
                            GA/Umum
                        </NavLink>
                        <NavLink
                            to="/lpj/marketing"
                            className={({ isActive }) =>
                                isActive
                                    ? 'block w-full py-2 pl-8 text-white bg-[#FF5B5F]'
                                    : 'block w-full py-2 pl-8 text-white hover:bg-[#FF5B5F]'
                            }
                        >
                            Marketing/Operasional
                        </NavLink>
                    </li>
                    {(role === 'reviewer' || role === 'admin') && (
                    <li>
                        <NavLink
                            to="/lpj/cek-laporan"
                            className={({ isActive }) =>
                                isActive
                                    ? 'block w-full py-2 pl-8 text-white bg-[#FF5B5F]'
                                    : 'block w-full py-2 pl-8 text-white hover:bg-[#FF5B5F]'
                            }
                        >
                            Cek Laporan
                        </NavLink>
                    </li>
                    )}
                    {role === 'admin' && (
                    <li>
                        <hr className="border-red-500" /> 
                        <NavLink
                            to="/manage-users"
                            className={({ isActive }) =>
                                isActive
                                    ? 'block w-full py-2 pl-8 text-white bg-[#FF5B5F]'
                                    : 'block w-full py-2 pl-8 text-white hover:bg-[#FF5B5F]'
                            }
                        >
                            Manage Users
                        </NavLink>
                    </li>
                )}
                </ul>
            </aside>
        </div>
    )
}

export default Sidebar
