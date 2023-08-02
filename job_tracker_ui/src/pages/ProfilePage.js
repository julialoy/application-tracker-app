import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';

export const ProfilePage = ( )  => {
    const [currUser, setCurrUser] = useState({});
    const [userId, setUserId] = useState('');
    const [userFirstName, setUserFirstName] = useState('');
    const [userLastName, setUserLastName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPass, setConfirmNewPass] = useState('');
    const navigate = useNavigate();

    const setUserInfo = (info) => {
         if (info !== '') {
             setUserId(info.user_id);
             setUserFirstName(info.first_name);
             setUserLastName(info.last_name);
             setUserEmail(info.email);
             setNewPassword('');
             setConfirmNewPass('');
         } else {
             setUserFirstName('');
             setUserLastName('');
             setUserEmail('');
             setNewPassword('');
             setConfirmNewPass('');
        }
    }

    const fetchUserInfo = async () => {
        const response = await fetch(`/edit-profile`, {method: 'GET'});
        const data = await response.json();
        if (response.status === 200) {
            setCurrUser(data.user);
            setUserInfo(data.user);
        } else {
            alert(`Unable to retrieve profile information: ${response.error}`);
            navigate('/');
        }
    }

    const resetProfileForm = () => {
        if (userId !== '') {
            setUserInfo(currUser);
        } else {
            setUserInfo('');
        }
    }

    const isPassConfirmed = (userPass, confirmPass) => {
        return (userPass === confirmPass);
    }

    const editUser = async (evt) => {
        evt.preventDefault();
        // Catch unmatched password and password confirmations before sending to server
        if (newPassword !== '') {
            if (!isPassConfirmed(newPassword, confirmNewPass)) {
                alert("Passwords do not match. Try again.");
                resetProfileForm();
                return null;
            }
        }

        const changedUser = {userFirstName, userLastName, userEmail, newPassword};
        const response = await fetch(`/edit-profile/${userId}`, {
            method: 'POST',
            body: JSON.stringify(changedUser),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.status === 201) {
            alert("Profile updated!");
            fetchUserInfo();
            navigate('/edit-profile');
        } else {
            const serverResp = await response.json();
            alert(`Unable to update profile: ${serverResp.error}`);
            resetProfileForm();
        }
    }

    useEffect( () => {
        fetchUserInfo();
        resetProfileForm();
    }, []);

    return (
        <div>
            <Navbar />
            <div>
                <h2>Hello, {currUser.first_name}!</h2>
                <p>Click into any box to edit your profile settings</p>
                <form onSubmit={editUser}>
                    <label htmlFor="userFirstName">
                        First Name *
                    </label>
                    <input
                        id="userFirstName"
                        type="text"
                        name="newFirstName"
                        value={userFirstName}
                        onChange={evt => setUserFirstName(evt.target.value)}
                        required
                    />
                    <label htmlFor="userLastName">
                        Last Name *
                    </label>
                    <input
                        id="userLastName"
                        type="text"
                        name="newLastName"
                        value={userLastName}
                        onChange={evt => setUserLastName(evt.target.value)}
                        required
                    />
                    <label htmlFor="userEmail">
                        Email *
                    </label>
                    <input
                        id="userEmail"
                        type="email"
                        name="newUserEmail"
                        value={userEmail}
                        onChange={evt => setUserEmail(evt.target.value)}
                        required
                    />
                    <p>Change your password:</p>
                    <label htmlFor="newPassword">
                        New Password *
                    </label>
                    <input
                        id="newPassword"
                        type="password"
                        name="newUserPassword"
                        value={newPassword}
                        onChange={evt => setNewPassword(evt.target.value)}
                    />
                    <label htmlFor="confirmNewPass">
                        Verify Password *
                    </label>
                    <input
                        id="confirmNewPass"
                        type="password"
                        name="confirmNewPass"
                        value={confirmNewPass}
                        onChange={evt => setConfirmNewPass(evt.target.value)}
                    />
                    <button id="profileSubmit" type="submit">Save Changes</button>
                </form>
            </div>
        </div>
    );
}

export default ProfilePage;
