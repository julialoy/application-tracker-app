import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [pword, setPword] = useState('');
    const [pwordConfirm, setPwordConfirm] = useState('');

    const navigate = useNavigate();

    const resetRegForm = () => {
        setEmail('');
        setPword('');
        setPwordConfirm('');
    }

    const registerUser = async (evt) => {
        evt.preventDefault();
        const newUser = {email, pword, pwordConfirm};
        const response = await fetch('/register', {
            method: 'POST',
            body: JSON.stringify(newUser),
            headers: {
                'Content-Type': 'application/json',
            },
        })
        if (response.status === 201) {
            alert("Registration successful");
            navigate('/');
        } else {
            alert("Error encountered during registration. Try again.");
            resetRegForm();
        }
    }

    return (
        <div>
            <form id="regForm">
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
                <label htmlFor="passConfirm">
                    Retype password
                </label>
                <input
                    id="passConfirm"
                    type="password"
                    name="confirmation"
                    placeholder="Retype password"
                    value={pwordConfirm}
                    onChange={evt => setPwordConfirm(evt.target.value)}
                    required
                />
                <button
                    id="regSubmit"
                    type="submit"
                    onClick={registerUser}
                >
                    Register
                </button>
            </form>
        </div>
    )
}

export default RegisterPage;