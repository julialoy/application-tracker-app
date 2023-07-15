import React from 'react';
import { Routes } from 'react-router';
import { BrowserRouter, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import JobPage from './pages/JobPage';
import SkillsPage from './pages/SkillsPage';
import ContactPage from './pages/ContactPage';

export const App = () => {

 return (
     <div className="App">
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<HomePage />} exact />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/jobs" element={<JobPage />} />
              <Route path="/skills" element={<SkillsPage />} />
              <Route path="/contacts" element={<ContactPage />} />
          </Routes>
      </BrowserRouter>
     </div>
 );
}

export default App;