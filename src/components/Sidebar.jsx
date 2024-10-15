import React from 'react'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
    return (
        <div>
            <aside className="fixed top-0 left-0 h-screen w-64 bg-red-600 pt-16">
                <ul className="w-full text-left">
                    <li>
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) =>
                                isActive
                                    ? 'block w-full py-2 pl-4 text-white bg-red-400 font-bold'
                                    : 'block w-full py-2 pl-4 text-white font-bold'
                            }
                        >
                            Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/reimbursement" className="block w-full py-2 pl-4 text-white font-bold">
                            Reimbursement
                        </NavLink>
                        <NavLink
                            to="/reimbursement/medical"
                            className={({ isActive }) =>
                                isActive
                                    ? 'block w-full py-2 pl-8 text-white bg-red-400'
                                    : 'block w-full py-2 pl-8 text-white'
                            }
                        >
                            Medical
                        </NavLink>
                        <NavLink
                            to="/reimbursement/bbm"
                            className={({ isActive }) =>
                                isActive
                                    ? 'block w-full py-2 pl-8 text-white bg-red-400'
                                    : 'block w-full py-2 pl-8 text-white'
                            }
                        >
                            BBM
                        </NavLink>
                        <NavLink
                            to="/reimbursement/operasional"
                            className={({ isActive }) =>
                                isActive
                                    ? 'block w-full py-2 pl-8 text-white bg-red-400'
                                    : 'block w-full py-2 pl-8 text-white'
                            }
                        >
                            Operasional
                        </NavLink>
                        <NavLink
                            to="/reimbursement/umum"
                            className={({ isActive }) =>
                                isActive
                                    ? 'block w-full py-2 pl-8 text-white bg-red-400'
                                    : 'block w-full py-2 pl-8 text-white'
                            }
                        >
                            GA/Umum
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/lpj"
                            className={({ isActive }) =>
                                isActive
                                    ? 'block w-full py-2 pl-4 text-white bg-red-400 font-bold'
                                    : 'block w-full py-2 pl-4 text-white font-bold'
                            }
                        >
                            LPJ Bon Sementara
                        </NavLink>
                        <NavLink
                            to="/lpj/umum"
                            className={({ isActive }) =>
                                isActive
                                    ? 'block w-full py-2 pl-8 text-white bg-red-400'
                                    : 'block w-full py-2 pl-8 text-white'
                            }
                        >
                            GA/Umum
                        </NavLink>
                        <NavLink
                            to="/lpj/marketing"
                            className={({ isActive }) =>
                                isActive
                                    ? 'block w-full py-2 pl-8 text-white bg-red-400'
                                    : 'block w-full py-2 pl-8 text-white'
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
