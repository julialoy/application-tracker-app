import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './RegisterPage.css';

export const RegisterPage = ( ) => {
    const [email, setEmail] = useState('');
    const [pword, setPword] = useState('');
    const [pwordConfirm, setPwordConfirm] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [showPasswordTooltip, setShowPasswordTooltip] = useState(false);

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
    };

    const togglePasswordTooltip = () => {
        setShowPasswordTooltip(!showPasswordTooltip);
    };

    return (
        <div className='register-page-container'>
            {/* Logo */}
            <img src="/TJTLogo.png" alt="TJT Logo" className="registerlogo" />
            <form className="register-form" onSubmit={registerUser}>
                <h3>Welcome to Job Tracker!</h3>
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
                </label>

                {/* Password Tooltip */}
                <div className="password-tooltip" onClick={togglePasswordTooltip}>
                <span>?</span>
                {showPasswordTooltip && (
                    <div className="tooltip-content">
                    Must be at least 8 characters long and contain:
                    <ul>
                        <li>At least one uppercase letter</li>
                        <li>At least one lowercase letter</li>
                        <li>At least one number</li>
                        <li>At least one special character</li>
                    </ul>
                    </div>
                )}
                </div>

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
                <p>
                Already have an account?{' '}
                <Link to="/login">Login now!</Link>
                </p>
            </form>
        </div>
    )
}

export default RegisterPage;