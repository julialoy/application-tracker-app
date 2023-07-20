import React from 'react';
import { Link } from 'react-router-dom';

export const HomePage = () => {
    return (
        <div>
            <p>Under Construction</p>
            <Link to="/register">Register</Link>
            <br />
            <Link to="/login">log in</Link>
        </div>
    );
}

export default HomePage;