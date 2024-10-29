import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { validPaths } from './routesConfig';

const SidebarWrapper = ({ role }) => {
    const location = useLocation();
    const showSidebar = location.pathname !== '/' && validPaths.includes(location.pathname);
    return showSidebar ? <Sidebar role={role} /> : null;
};

export default SidebarWrapper;
