// import React, { useEffect } from "react";
// import Layout from "./Layout";
// import Welcome from "../components/Welcome";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { getMe } from "../features/authSlice";

import React, { useEffect } from 'react'
import Layout from './Layout'
import Welcome from '../components/Welcome'
// import { useDispatch } from "react-redux";

const Dashboard = () => {
    //   const dispatch = useDispatch();
    // const navigate = useNavigate();
    // const { isError } = useSelector((state) => state.auth);

    //   useEffect(() => {
    //     dispatch(getMe());
    //   }, [dispatch]);

    // useEffect(() => {
    //   if (isError) {
    //     navigate("/");
    //   }
    // }, [isError, navigate]);

    useEffect(() => {
        document.title = 'Dashboard - Samudera Indonesia'
    }, [])

    return (
        <div>
            <Layout>
                <Welcome />
            </Layout>
        </div>
    )
}

export default Dashboard
