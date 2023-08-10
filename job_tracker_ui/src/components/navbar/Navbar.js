import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();

    return (
        <nav className="header">
            <Link to="/">
                <img src="/TJTLogo.png" alt="logo" className="logo" />
            </Link>
            <div className="nav-links-wrapper">
                <ul className="nav-links">
                    <li><Link to="/" className={location.pathname === "/" ? "active" : ""}>HOME</Link></li>
                    <li><Link to="/jobs" className={location.pathname === "/jobs" ? "active" : ""}>JOBS</Link></li>
                    <li><Link to="/skills" className={location.pathname === "/skills" ? "active" : ""}>SKILLS</Link></li>
                    <li><Link to="/contacts" className={location.pathname === "/contacts" ? "active" : ""}>NETWORKING</Link></li>
                </ul>
            </div>

            <div className="logout-wrapper">
                <Link to="/logout" className="logout-btn">LOG OUT</Link>
            </div>

            <Link to="/edit-profile" className={location.pathname === "/edit-profile" ? "active profile-btn" : "profile-btn"}>
                <img src="/EditProfile.png" alt="Profile" />
            </Link>
        </nav>
    );
}

export default Navbar;
