import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const Logout = ( ) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        axios.get(`http://ec2-44-215-13-166.compute-1.amazonaws.com:5000/api/logout`, {withCredentials: true})
            .then(response => {
                if (response.status === 200) {
                    alert("Successfully logged out.");
                    navigate('/');
                } else {
                    alert("Could not log user out.");
                    navigate('/');
                }
            });
    }

    useEffect(() => {
        handleLogout();
    });

    return null;
}

export default Logout;