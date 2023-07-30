import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Navbar from '../components/navbar/Navbar';

export const HomePage = () => {
    return (
        <div>
            <Navbar />
            <Header />
            <Link to="/register">Register</Link>
            <br />
            <Link to="/login">Log in</Link>
            <Footer />
        </div>
    );
}

export default HomePage;