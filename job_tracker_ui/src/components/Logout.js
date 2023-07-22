import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Logout = () => {
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
            navigate('/');
        } else {
            alert("Could not log user out.");
        }
    }
}

export default Logout;