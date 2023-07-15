import React, { useState,useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar/Navbar';


export default ContactPage;


function ContactPage() {
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    notes: '',
  });
  const [editingContact, setEditingContact] = useState(null);



  const addContact = async (event) => {
    event.preventDefault();
    try {
        const response = await axios.post('/pages/contacts', newContact);
        setContacts([...contacts, response.data]);
        setNewContact({ name: '', phone: '', email: '', company: '', notes: '' });
    } catch (error) {
        console.error(error);
    }
};

  const editContact = async (id, updatedContact) => {
    try {
      const response = await axios.put(`/pages/contacts/${id}`, updatedContact);
      setContacts(contacts.map((contact) => (contact.id === id ? updatedContact : contact)));
      setEditingContact(null);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteContact = async (id) => {
    try {
      const response = await axios.delete(`/pages/contacts/${id}`);
      setContacts(contacts.filter((contact) => contact.id !== id));
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
      <h1>Networking Page</h1>
      <div>
            <Navbar />
        </div>

      <form onSubmit={addContact}>
        <input
          type="text"
          placeholder="Name"
          value={newContact.name}
          onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
        />

        <input
          type="text"
          placeholder="Phone"
          value={newContact.phone}
          onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
        />

        <input
          type="text"
          placeholder="Email"
          value={newContact.email}
          onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
        />

        <input
          type="text"
          placeholder="Company"
          value={newContact.company}
          onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
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
          editContact(editingContact.id, editingContact);
        }}>
          <input
            type="text"
            placeholder="Name"
            value={editingContact.name}
            onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Phone"
            value={editingContact.phone}
            onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
          />
          <input
            type="text"
            placeholder="Email"
            value={editingContact.email}
            onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="Company"
            value={editingContact.company}
            onChange={(e) => setEditingContact({ ...editingContact, company: e.target.value })}
          />
          <input
            type="text"
            placeholder="Notes"
            value={editingContact.notes}
            onChange={(e) => setEditingContact({ ...editingContact, notes: e.target.value })}
          />

          {/* Add other fields here... */}
          <button type="submit">Save Changes</button>
          <button onClick={() => setEditingContact(null)}>Cancel</button>
        </form>
      )}

      <ul>
      {contacts.map((contact, index) => (
        <li key={index}>
          <p>Name: {contact.name}</p>
          <p>Phone: {contact.phone}</p>
          <p>Email: {contact.email}</p>
          <p>Company: {contact.company}</p>
          <p>Notes: {contact.notes}</p>
          <button onClick={() => setEditingContact(contact)}>Edit</button>
          <button onClick={() => deleteContact(contact.id)}>Delete</button>
        </li>
      ))}
    </ul>
  
    </div>
  );
}