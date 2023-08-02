import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Logout = ( ) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        const response = await fetch('/logout', {
            method: 'POST',
            body: JSON.stringify(),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.status === 200) {
            alert("Successfully logged out.");
            navigate('/login');
        } else {
            alert("Could not log user out.");
            navigate('/');
        }
    }

    useEffect(() => {
        handleLogout();
    });

    return null;
}

export default Logout;