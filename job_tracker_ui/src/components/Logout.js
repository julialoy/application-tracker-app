import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
import axInst from '../axios_instance';

export const Logout = ( ) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        axInst.get(
            `logout`,
            {withCredentials: true})
            .then(response => {
                if (response.status === 200) {
                    alert("Successfully logged out.");
                    navigate('/');
                } else {
                    alert("Could not log user out.");
                    navigate('/');
                }})
            .catch(err => {
                console.error(err);
               alert(`Could not log user out: Internal server error.`);
               navigate('/');
            });

    }

    useEffect(() => {
        handleLogout();
    });

    return null;
}

export default Logout;