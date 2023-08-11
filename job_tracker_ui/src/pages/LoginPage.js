import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './RegisterPage.css';
// import axios from 'axios';
import axInst from "../axios_instance";

export const LoginPage = ( ) => {
    const [email, setEmail] = useState('');
    const [pword, setPword] = useState('');

    const navigate = useNavigate();

    const resetLoginForm = () => {
        setEmail('');
        setPword('');
    }

    const loginUser = async (evt) => {
        evt.preventDefault();
        const user = {username: email, password: pword};
        axInst.post(`login`, user, {withCredentials: true})
            .then(result => {
                if (result.status === 200) {
                    resetLoginForm();
                    alert("Login successful");
                    navigate('/');
                } else {
                    alert("Error encountered during login. Try again.");
                    resetLoginForm();
                }
            })
            .catch(error => {
                alert("Internal server error");
                console.error(error);
            });
    }

    return (
        <div className="register-page-container">
            {/* Logo */}
            <img src="/TJTLogo.png" alt="TJT Logo" className="registerlogo" />
            <form className="register-form" id="loginForm">
                <h3>Welcome Back!</h3>
                <label htmlFor="userEmail">
                    Email address
                </label>
                <input
                    id="userEmail"
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={email}
                    onChange={evt => setEmail(evt.target.value)}
                    required
                />
                <label htmlFor="userPassword">
                    Password
                </label>
                <input
                    id="userPassword"
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={pword}
                    onChange={evt => setPword(evt.target.value)}
                    required
                />
                <button
                    id="loginSubmit"
                    type="submit"
                    onClick={loginUser}
                >
                    Login
                </button>
                <p>
                Don't have an account?{' '}
                <Link to="/Register">Register now!</Link>
                </p>
            </form>
        </div>
    )
}

export default LoginPage;