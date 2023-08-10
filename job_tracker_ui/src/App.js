import './App.css';
import React, { useState } from 'react';
import { Routes } from 'react-router';
import { BrowserRouter, Route} from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Logout from './components/Logout';
import JobPage from './pages/JobPage';
import SkillsPage from './pages/SkillsPage';
import ContactPage from './pages/ContactPage';
import EditSkillsPage from './pages/EditSkillsPage';
import EditJobPage from './pages/EditJobPage';
import EditContactPage from './pages/EditContactPage';
import ProfilePage from './pages/ProfilePage';

export const App = () => {
    const [targetSkill, setTargetSkill] = useState();

 return (
     <div className="App">
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<HomePage />} exact />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/jobs" element={<JobPage />} />
              <Route path="/jobs/edit/:id" element={<EditJobPage  />} />
              <Route path="/skills" element={<SkillsPage setTargetSkill={setTargetSkill} />} />
              <Route path="/edit-skill" element={<EditSkillsPage targetSkill={targetSkill} />} />
              <Route path="/contacts" element={<ContactPage />} />
              <Route path="/contacts/edit/:id" element={<EditContactPage />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="/edit-profile" element={<ProfilePage />} />
          </Routes>
      </BrowserRouter>
     </div>
 );
}

export default App;