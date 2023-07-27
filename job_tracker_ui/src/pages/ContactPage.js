import React, { useState,useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar/Navbar';


export default ContactPage;


function ContactPage() {
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({
    first_name: '',
    last_name: '',
    email: '',
    company_id: '',
    notes: '',
  });
  const [editingContact, setEditingContact] = useState(null);

  const addContact = async (event) => {
    event.preventDefault();
    try {
        const response = await axios.post('/pages/contacts', newContact);
        setContacts([...contacts, response.data]);
        setNewContact({ first_name: '', last_name: '', email: '', company_id: '', notes: '' });
    } catch (error) {
        console.error(error);
    }
  };

  const editContact = async (contact_id, updatedContact) => {
    try {
      const response = await axios.put(`/pages/contacts/${contact_id}`, updatedContact);
      setContacts(contacts.map((contact) => (contact.contact_id === contact_id ? updatedContact : contact)));
      setEditingContact(null);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteContact = async (contact_id) => {
    try {
      await axios.delete(`/pages/contacts/${contact_id}`);
      setContacts(contacts.filter((contact) => contact.contact_id !== contact_id));
    } catch (error) {
      console.error(error);
    }};

    useEffect(() => {
        axios.get('/contacts')
            .then(response => {
                setContacts(response.data);
            })
            .catch(error => {
                console.error(error);
            });
    }, []);

  return (
    <div>
      <div>
            <Navbar />
            <h1 className="PageHeader">Networking Page</h1>
        </div>

      <form onSubmit={addContact}>
        <input
          type="text"
          placeholder="First Name"
          value={newContact.first_name}
          onChange={(e) => setNewContact({ ...newContact, first_name: e.target.value })}
        />

        <input
          type="text"
          placeholder="Last Name"
          value={newContact.last_name}
          onChange={(e) => setNewContact({ ...newContact, last_name: e.target.value })}
        />

        <input
          type="text"
          placeholder="Email"
          value={newContact.email}
          onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
        />

        <input
          type="text"
          placeholder="Company ID"
          value={newContact.company_id}
          onChange={(e) => setNewContact({ ...newContact, company_id: e.target.value })}
        />

        <input    
          type="text"
          placeholder="Notes"
          value={newContact.notes}
          onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
        />

        <button type="submit">Add Contact</button>
      </form>

      {editingContact && (
        <form onSubmit={(e) => {
          e.preventDefault();
          editContact(editingContact.contact_id, editingContact);
        }}>
          <input
            type="text"
            placeholder="First Name"
            value={editingContact.first_name}
            onChange={(e) => setEditingContact({ ...editingContact, first_name: e.target.value })}
          />

          <input
            type="text"
            placeholder="Last Name"
            value={editingContact.last_name}
            onChange={(e) => setEditingContact({ ...editingContact, last_name: e.target.value })}
          />

          <input
            type="text"
            placeholder="Email"
            value={editingContact.email}
            onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
          />

          <input
            type="text"
            placeholder="Company ID"
            value={editingContact.company_id}
            onChange={(e) => setEditingContact({ ...editingContact, company_id: e.target.value })}
          />

          <input
            type="text"
            placeholder="Notes"
            value={editingContact.notes}
            onChange={(e) => setEditingContact({ ...editingContact, notes: e.target.value })}
          />

          <button type="submit">Save Changes</button>
          <button onClick={() => setEditingContact(null)}>Cancel</button>
        </form>
      )}

      <ul>
      {contacts.map((contact, index) => (
        <li key={index}>
          <p>First Name: {contact.first_name}</p>
          <p>Last Name: {contact.last_name}</p>
          <p>Email: {contact.email}</p>
          <p>Company ID: {contact.company_id}</p>
          <p>Notes: {contact.notes}</p>
          <button onClick={() => setEditingContact(contact)}>Edit</button>
          <button onClick={() => deleteContact(contact.contact_id)}>Delete</button>
        </li>
      ))}
    </ul>
  
    </div>
  );
}