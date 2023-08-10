import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './EditPages.css'

export const EditContactPage = () => {
    const [contact, setContact] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        axios.get(`/contacts/${id}`)
            .then(response => {
                setContact(response.data);
            })
            .catch(error => {
                console.error(error);
            });
    }, [id]);

    const editingContact = (event) => {
        event.preventDefault();
        axios.put(`/contacts/edit/${id}`, contact)
            .then(response => {
                navigate('/contacts');
            })
            .catch(error => {
                console.error("Error from server: ", error);  
                console.error(error);
            });
    };

    if (!contact) {
        return null; 
    }

    return (
      <div className='editpage'>
          <form onSubmit={editingContact}>
              <h2>Edit This Contact</h2>
              <hr /> {/* line */}
              <p>Enter any changes and press 'Save Changes'</p>
              
              <label>
                First Name:
              </label>
              <input
                type="text"
                value={contact.first_name}
                onChange={(e) => setContact({ ...contact, first_name: e.target.value })}
                placeholder="first name" required 
              />

              <label>
                Last Name:
              </label>
              <input
                type="text"
                value={contact.last_name}
                onChange={(e) => setContact({ ...contact, last_name: e.target.value })}
                placeholder="last name" required
              />
    
              <label>
                Email:
              </label>
              <input
                type="text"
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                placeholder="email" required
              />
    
              <label>
                Company:
              </label>
              <input
                type="text"
                value={contact.company}
                onChange={(e) => setContact({ ...contact, company: e.target.value })}
                placeholder="company" required
              />
    
              <label>
                Notes:
              </label>
              <input
                type="text"
                value={contact.notes}
                onChange={(e) => setContact({ ...contact, notes: e.target.value })}
                placeholder="notes"
              />
              <button type="submit">Save Changes</button>
              <button onClick={() => navigate('/contacts')} className="back-button">
                          Back to Contacts
                      </button>
            </form>
          </div>
    );
};

export default EditContactPage;