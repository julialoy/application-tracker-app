import React, { useState,useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Modal from 'react-modal';
import axInst from '../axios_instance';
import Navbar from '../components/navbar/Navbar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ContactPage.css'

Modal.setAppElement(document.getElementById('root'));

function ContactPage() {
  const [userId, setUserId] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
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
    axInst.get('contacts', {withCredentials: true})
        .then(response => {
          setUserId(response.data);
        })
        .catch(error => {
            console.error(error);
        });
}, []);

  const fetchContacts = () => {
    axInst.get('contacts', {withCredentials: true})
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

  useEffect(() => {
    axInst.get('user/firstName', {withCredentials: true})
        .then(response => {
            setFirstName(response.data.firstName);
        })
        .catch(error => console.error(error));
  }, []);


  const addContact = async (event) => {
    event.preventDefault();
    axInst.post('contacts', newContact, {withCredentials: true})
        .then(response => {
            if (response.status === 201) {
                setIsAddOpen(false);
                alert("Contact added");
                resetContactForm();
                fetchContacts();
            } else {
                setIsAddOpen(false);
                console.error(response.data);
                alert("Unable to add contact");
                resetContactForm();
            }
        })
        .catch(err => {
            console.error(err);
            alert("Unable to add contact: Internal server error");
            resetContactForm();
        });
  };

  const editContact = async (contact_id, updatedContact) => {
    try {
      const response = await axInst.put(`edit/${contact_id}`, updatedContact, {withCredentials: true});
      setContacts(contacts.map((contact) => (contact.contact_id === contact_id ? updatedContact : contact)));
      setEditingContact(null);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteContact = async (contact_id) => {
    try {
      await axInst.delete(`contacts/${contact_id}`, {withCredentials: true});
      setContacts(contacts.filter((contact) => contact.contact_id !== contact_id));
    } catch (error) {
      console.error(error);
    }};

    useEffect(() => {
        axInst.get('contacts', {withCredentials: true})
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

    if (!firstName) { // If firstName is null, user is not logged in
      return (
          <div>
              <Navbar />
              <Header />
              <div className='HomePage'>
              <p>You must be logged in to view this page.</p>
              <Link to="/register">Register</Link>
              <br />
              <Link to="/login">Log in</Link>
              </div>
              <Footer />
          </div>
      );
  }


  return (
    <div>
      <Navbar />
      <div className="ContactPage">
        <h1 className="PageHeader">Networking Page</h1>
        {/* form to create a new contact */}
        <button type="button" className="new-contact-button"
                onClick={handleOpenAddModal}>
            New Contact
        </button>
        <Modal
            className="modal"
            isOpen={isAddOpen}
            onRequestClose={handleCloseAddModal}
            portalClassName={""}
            shouldCloseOnEsc={true}
            preventScroll={true}
        >
        <form onSubmit={addContact}>
        <h2>Add a new Contact</h2>
        <hr /> {/* line */}
        <p>Enter your new Contact's information</p>
        <input
          id= 'jobTitle' 
          type="text"
          placeholder="First Name"
          value={newContact.first_name}
          onChange={(e) => setNewContact({ ...newContact, first_name: e.target.value })}
        />

        <input
          id= 'jobTitle' 
          type="text"
          placeholder="Last Name"
          value={newContact.last_name}
          onChange={(e) => setNewContact({ ...newContact, last_name: e.target.value })}
        />

        <input
          id= 'jobTitle' 
          type="text"
          placeholder="Email"
          value={newContact.email}
          onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
        />

        <input
          id= 'jobTitle' 
          type="text"
          placeholder="Company"
          value={newContact.company}
          onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
        />

        <input    
          id= 'jobDesc'
          type="text"
          placeholder="Notes"
          value={newContact.notes}
          onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
        />

        <button id="ContactSubmit" type="submit">Add Contact</button>
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
                              <button className='edit-button' onClick={() => navigate(`/contacts/edit/${contact.contact_id}`)}>Edit</button>
                              <button className='delete-button' onClick={() => deleteContact(contact.contact_id)}>Delete</button>
                          </td>
                      </tr>
                      ))}
                      </tbody>
                  </table>
              </div>
        </div>
    </div>
  );
}

export default ContactPage;