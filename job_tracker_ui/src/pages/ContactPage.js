import React, { useState,useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';

Modal.setAppElement(document.getElementById('root'));


function ContactPage() {
  const [userId, setUserId] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    first_name: '',
    last_name: '',
    email: '',
    company: '',
    notes: '',
  });
  const [editingContact, setEditingContact] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/contacts')
        .then(response => {
          setUserId(response.data);
        })
        .catch(error => {
            console.error(error);
        });
}, []);

  const fetchContacts = () => {
    axios.get('/contacts')
        .then(response => {
          setContacts(response.data);
        })
        .catch(error => {
            console.error(error);
        });
  };

  useEffect(() => {
    fetchContacts();
}, []);


  const addContact = async (event) => {
    event.preventDefault();
    const cobtactData = {...newContact}; 
    const response = await fetch('/contacts', { 
      method: 'POST',
      body: JSON.stringify(newContact),
      headers: {
          'Content-Type': 'application/json',
      },
      });
      if (response.status === 201) {
        setIsAddOpen(false);
        alert("Contact added");
        resetContactForm();
        fetchContacts();
      } else {
          setIsAddOpen(false);
          console.error(response);
          alert("Unable to add contact");
          resetContactForm();
      }



  };

  const editContact = async (contact_id, updatedContact) => {
    try {
      const response = await axios.put(`/contacts/edit/${contact_id}`, updatedContact);
      setContacts(contacts.map((contact) => (contact.contact_id === contact_id ? updatedContact : contact)));
      setEditingContact(null);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteContact = async (contact_id) => {
    try {
      await axios.delete(`/contacts/${contact_id}`);
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

    const resetContactForm = () => {
      setNewContact({ first_name: '',
      last_name: '',
      email: '',
      company: '',
      notes: '',});
  };


    const handleOpenAddModal = () => {
        setIsAddOpen(true);
    };

    const handleCloseAddModal = () => {
        setIsAddOpen(false);
    };


  return (
    <div>
            <Navbar />
            <h1 className="PageHeader">Networking Page</h1>
            {/* form to create a new contact */}
            <button type="button" className="new-contact-button"
                    onClick={handleOpenAddModal}>
                New Contact
            </button>
            <Modal
                isOpen={isAddOpen}
                onRequestClose={handleCloseAddModal}
                portalClassName={""}
                shouldCloseOnEsc={true}
                preventScroll={true}
            >
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
            </Modal>
            <div>
                    <table id="contacts">
                        <thead>
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Company</th>
                            <th>Notes</th>
                            <th>Edit/Delete</th>
                        </tr>
                        </thead>
                        <tbody>
                            {contacts.map((contact, index) => (
                            <tr key={index}>
                            <td>{contact.first_name}</td>
                            <td>{contact.last_name}</td>
                            <td>{contact.email}</td>
                            <td>{contact.company}</td>
                            <td>{contact.notes}</td>
                            <td>
                                <button onClick={() => navigate(`/contacts/edit/${contact.contact_id}`)}>Edit</button>
                                <button onClick={() => deleteContact(contact.contact_id)}>Delete</button>
                            </td>
                        </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
    </div>
  );
}

export default ContactPage;