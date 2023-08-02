import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const RegisterPage = ( ) => {
    const [email, setEmail] = useState('');
    const [pword, setPword] = useState('');
    const [pwordConfirm, setPwordConfirm] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const navigate = useNavigate();

    const isPassConfirmed = (userPass, confirmPass) => {
        return (userPass === confirmPass);
    }

    const resetRegForm = () => {
        setEmail('');
        setPword('');
        setPwordConfirm('');
        setFirstName('');
        setLastName('');
    }

    const registerUser = async (evt) => {
        evt.preventDefault();
        if (!isPassConfirmed(pword, pwordConfirm)) {
            alert("Passwords don't match. Try again.");
            resetRegForm();
        } else {
            const newUser = {email, pword, pwordConfirm, firstName, lastName};
            const response = await fetch('/register', {
                method: 'POST',
                body: JSON.stringify(newUser),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.status === 201) {
                alert("Registration successful");
                navigate('/jobs');
            } else if (response.status === 400) {
                alert("One or more of the fields were invalid or an account with that email already exists");
                resetRegForm();
            } else {
                alert("Error encountered during registration. Try again.");
                resetRegForm();
            }
        }
    }

    return (
        <div>
            <form onSubmit={registerUser}>
                <label htmlFor="userFirstName">
                    First Name *
                </label>
                <input
                    id="userFirstName"
                    type="text"
                    name="lastName"
                    placeholder="First name"
                    value={firstName}
                    onChange={evt => setFirstName(evt.target.value)}
                    required
                />
                <label htmlFor="userLastName">
                    Last Name *
                </label>

                <input
                    id="userLastName"
                    type="text"
                    name="firstName"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={evt => setLastName(evt.target.value)}
                    required
                />
                <label htmlFor="userEmail">
                    Email *
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
                    Password * <br />
                    (Must be at least 8 characters long and contain at least 1 of the following:
                    uppercase letter, lowercase letter, number, special character)
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
                    Verify Password *
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