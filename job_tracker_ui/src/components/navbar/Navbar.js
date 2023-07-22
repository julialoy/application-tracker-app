import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav>
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/jobs">Jobs</Link></li>
                <li><Link to="/skills">Skills</Link></li>
                <li><Link to="/contacts">Contacts</Link></li>
            </ul>
        </nav>
    );
}

export default Navbar;