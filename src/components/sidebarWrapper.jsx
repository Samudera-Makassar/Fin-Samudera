import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { validPaths } from './routesConfig';

const SidebarWrapper = ({ role }) => {
    const location = useLocation();
    const showSidebar = location.pathname !== '/' && validPaths.includes(location.pathname);
    // const showSidebar = location.pathname !== '/' && !location.pathname.includes('not-found');
    return showSidebar ? <Sidebar role={role} /> : null;
};

export default SidebarWrapper;
