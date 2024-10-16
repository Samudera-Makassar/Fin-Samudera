import React from 'react'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
    return (
        <div>
            <aside className="fixed top-0 left-0 h-screen w-64 bg-[#ED1C24] pt-16">
                <ul className="w-full text-left">
                    <li>
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) =>
                                isActive
                                    ? 'block w-full py-2 pl-4 text-white font-bold bg-[#FF5B5F]'
                                    : 'block w-full py-2 pl-4 text-white font-bold hover:bg-[#FF5B5F]'
                            }
                        >
                            Dashboard
                        </NavLink>
                    </li>
                    <li>
                        {/* Menu Reimbursement (Non-clickable) */}
                        <span className="block w-full py-2 pl-4 text-white font-bold cursor-default">
                            Reimbursement
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
                    <li>
                        {/* Menu LPJ Bon Sementara (Non-clickable) */}
                        <span className="block w-full py-2 pl-4 text-white font-bold cursor-default">
                            LPJ Bon Sementara
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
                </ul>
            </aside>
        </div>
    )
}

export default Sidebar
