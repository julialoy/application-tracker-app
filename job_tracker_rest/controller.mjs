import 'dotenv/config';
import * as model from './model.mjs';
import express from 'express';
import crypto from 'crypto';
import expressSession from 'express-session';

const secret = crypto.randomBytes(64).toString('hex');
console.log(secret);

// Set up environment and constants
const PORT = process.env.PORT;
const app = express();
app.use(express.json());

app.use(expressSession({
    secret: secret,
    resave: false,
    saveUninitialized: true
  }));

// Validate password per specs:
//      8 characters or more in length
//      Contains at least 1 uppercase letter
//      Contains at least 1 lowercase letter
//      Contains at least 1 digit
//      Contains at least 1 special character in set ~`!@#$%^&*()_-+={[}]|\:;"'<,>.?/
//      Does not contain whitespace
const isPasswordValid = (pword) => {
    if (pword.length <= 8) {
        return false;
    } else if (!pword.match(/[a-z]/)) {
        return false;
    } else if (!pword.match(/[A-Z]/)) {
        return false;
    } else if (!pword.match(/\d/)) {
        return false;
    } else if (pword.match(/\s/)) {
        return false;
    } else if (!pword.match(/[~`!@#$%^&*()_\-+={\[}\]|\\:;"'<,>.?\/]/)) {
        return false;
    }
    return true;
};

function ensureLoggedIn(req, res, next) {
    if (req.session.user) {
        // User is logged in, proceed to the next middleware/route handler
        console.log("User is logged in");
        console.log(req.session.user.user_id);
        next();
    } else {
        // User is not logged in
        // Send an error response or redirect to a login page
        res.status(401).json({ error: 'User not logged in' });
    }
}

// Routes here

app.post('/register', (req, res) => {
   const userFirstName = req.body.firstName;
   const userLastName = req.body.lastName;
   const email = req.body.email;
   const userpass = req.body.pword;
   if (isPasswordValid(userpass)) {
       model.addUser(email, userFirstName, userLastName, userpass)
           .then(result => {
                if (result.error) {
                    res.status(400).setHeader('content-type', 'application/json')
                        .json({error: "An account with that email already exists"});
                } else {
                    // Upon successful registration user is logged in
                    req.session.user = result;
                    res.status(201).setHeader('content-type', 'application/json')
                        .json({user: result});
                }
               })
           .catch(error => {
               res.status(500).setHeader('content-type', 'application/json')
                   .json({error: "Unable to complete registration"});
           });
   } else {
       res.status(400).setHeader('content-type', 'application/json')
           .json({error: "Invalid password."});
   }
});

app.post('/login', (req, res) => {
    const email = req.body.username;
    const password = req.body.password;

    console.log(`Username: ${email}, Password: ${password}`); // Logging the username and password

    try {
        model.authenticateUser(email, password)
            .then(user => {
                if (user) {
                    req.session.user = user;
                    res.redirect('/');
                } else {
                    res.status(400).json({ error: 'Authentication failed.' });
                }
            })
            .catch(err => {
                console.error(`Error during authentication: ${err}`); // Logging error during authentication
                res.status(500).json({ error: 'Server error.' });
            });
    } catch (err) {
        console.error(`Caught exception: ${err}`); // Logging any caught exceptions
        res.status(500).json({ error: 'Server error.' });
    }
});


app.get('/user/firstName', (req, res) => {
    if (req.session.user && req.session.user.first_name) { 
        res.json({ firstName: req.session.user.first_name }); 
    } else {
        res.status(400).json({ error: 'User not logged in.' });
    }
});

app.post('/logout', ensureLoggedIn, (req, res) => {
   try {
       req.session.user = null;
       res.redirect('/');
   } catch (err) {
       res.status(500).json({error: "Error during logout."});
   }
});

app.get('/', (req, res) => {
    res.render('home');
});

// Fetch all jobs for the logged in user
app.get('/jobs', ensureLoggedIn, (req, res) => {
    const userId = req.session.user.user_id;
    model.getJobs(userId)
        .then(result => {
            if (result.error) {
                res.status(400).setHeader('content-type', 'application/json')
                    .json({ error: "Unable to retrieve jobs" });
            } else {
                res.status(200).setHeader('content-type', 'application/json')
                    .json(result.jobs);
            }
        })
        .catch(error => {
            res.status(500).setHeader('content-type', 'application/json')
                .json({ error: "Internal server error" });
        });
});

// Fetch skills for a specific job
app.get('/jobs/:job_id/skills', ensureLoggedIn, (req, res) => {
    const { job_id } = req.params;
    const user_id = req.session.user.user_id;
    model.getJobSkills(user_id, job_id)
        .then(result => {
            if (result.error) {
                res.status(404).setHeader('content-type', 'application/json')
                    .json({ message: 'Job not found' });
            } else {
                res.status(200).setHeader('content-type', 'application/json')
                    .json(result.jobSkills);
            }
        })
        .catch(error => {
            res.status(500).setHeader('content-type', 'application/json')
                .json({ error: "Internal server error" });
        });
});

// Retrieve specific job
app.get('/jobs/:job_id', ensureLoggedIn, (req, res) => {
    const { job_id } = req.params;
    const user_id = req.session.user.user_id;
    model.findJob(user_id, job_id)
        .then(result => {
            if (result.error) {
                res.status(500).setHeader('content-type', 'application/json')
                    .json(result.error);
            } else {
                res.status(200).setHeader('content-type', 'application/json')
                    .json(result);
            }
        })
        .catch(error => {
            res.status(500).setHeader('content-type', 'application/json')
                .json({ error: "Internal server error" });
        });
});

// Create a new job
app.post('/jobs', ensureLoggedIn, (req, res) => {
    const { job_title, company, location, status, date_applied, notes, skills } = req.body;
    const user_id = req.session.user.user_id;
    model.addJob(job_title, company, location, status, date_applied, notes, skills, user_id)
        .then(result => {
            if (result.error) {
                res.status(500).setHeader('content-type', 'application/json')
                    .json({ error: "Internal server error" });
            } else {
                res.status(201).setHeader('conent-type', 'application/json')
                    .json(result);
            }
        })
        .catch(error => {
            res.status(500).setHeader('content-type', 'application/json')
                .json({ error: "Internal server error" });
        });
});

// Update an existing job
app.put('/jobs/edit/:job_id', ensureLoggedIn, async (req, res) => {
    const { job_id } = req.params;
    const { job_title, company, location, status, date_applied, notes, skills } = req.body;
    const user_id = req.session.user.user_id;
    model.editJob(job_title, company, location, status, date_applied, notes, skills, job_id, user_id)
        .then(result => {
            if (result.error) {
                res.status(500).setHeader('content-type', 'application/json')
                    .json({ error: "Internal server error" });
            } else {
                res.status(200).setHeader('content-type', 'application/json')
                    .json(result);
            }
        })
        .catch(error => {
            res.status(500).setHeader('content-type', 'application/json')
                .json({ error: "Internal server error" });
        });
});


// Delete an existing job
app.delete('/jobs/:job_id', ensureLoggedIn, (req, res) => {
    const { job_id } = req.params;
    const user_id = req.session.user.user_id;
    model.deleteJob(job_id, user_id)
        .then(result => {
            if (result.error) {
                res.status(500).setHeader('content-type', 'application/json')
                    .json({error: "Internal server error"});
            } else {
                res.status(200).setHeader('content-type', 'application/json')
                    .json({ status: 'success', message: 'Job deleted' });
            }
        })
        .catch(error => {
            res.status(500).setHeader('content-type', 'application/json')
                .json({error: "Internal server error"});
        });
});

app.get('/contacts', (req, res) => {
    const user_id = req.session.user.user_id;
    model.getContacts(user_id)
        .then(result => {
            if (result.error) {
                res.status(500).setHeader('content-type', 'application/json')
                    .json({error: "Internal server error" });
            } else {
                res.status(200).setHeader('content-type', 'application/json')
                    .json(result);
            }
        })
        .catch(error => {
            res.status(500).setHeader('content-type', 'application/json')
                .json({error: "Internal server error" });
        });
});

app.post('/contacts',ensureLoggedIn,(req, res) => {
    const { first_name, last_name, email, company, notes } = req.body;
    const user_id = req.session.user.user_id;
    model.addContact(first_name, last_name, email, company, notes, user_id)
        .then(result => {
            if (result.error) {
                res.status(500).setHeader('content-type', 'application/json')
                    .json({ error: "Internal server error" });
            } else {
                res.status(201).setHeader('content-type', 'application/json')
                    .json(result);
            }
        })
        .catch(error => {
            res.status(500).setHeader('content-type', 'application/json')
                .json({ error: "Internal server error" });
        });
});

app.put('/contacts/edit/:contact_id', ensureLoggedIn,(req, res) => {
    const { contact_id } = req.params;
    const { first_name, last_name, email, company, notes } = req.body;
    const user_id = req.session.user.user_id;
    model.editContact(first_name, last_name, email, company, notes, contact_id, user_id)
        .then(result => {
            if (result.error) {
                res.status(500).setHeader('content-type', 'application/json')
                    .json({ error: "Internal server error" });
            } else {
                res.status(200).setHeader('content-type', 'application/json')
                    .json(result);
            }
        })
        .catch(error => {
            res.status(500).setHeader('content-type', 'application/json')
                .json({ error: "Internal server error" });
        });
});

app.get('/contacts/:contact_id', ensureLoggedIn, (req, res) => {
    const { contact_id } = req.params;
    const user_id = req.session.user.user_id;
    model.findContact(contact_id, user_id)
        .then(result => {
            if (result.error) {
                res.status(404).setHeader('content-type', 'application/json')
                    .json({ error: "Contact not found" });
            } else {
                res.status(200).setHeader('content-type', 'application/json')
                    .json(result);
            }
        })
        .catch(error => {
            res.status(500).setHeader('content-type', 'application/json')
                .json({ error: "Internal server error" });
        });
});

app.delete('/contacts/:contact_id',ensureLoggedIn, (req, res) => {
    const { contact_id } = req.params;
    const user_id = req.session.user.user_id;
    model.deleteContact(contact_id, user_id)
        .then(result => {
            if (result.error) {
                res.status(500).setHeader('content-type', 'application/json')
                    .json({ error: "Internal server error" });
            } else {
                res.status(200).setHeader('content-type', 'application/json')
                    .json({ status: 'success', message: 'Contact deleted' });
            }
        })
        .catch(error => {
            res.status(500).setHeader('content-type', 'application/json')
                .json({ error: "Internal server error" });
        });
});

app.get('/skills', ensureLoggedIn, (req, res ) => {
    const userId = req.session.user.user_id;
    model.getSkills(userId)
        .then(result => {
            if (result.error) {
                res.status(400).setHeader('content-type', 'application/json')
                    .json({error: "Unable to retrieve skills"});
            } else {
                res.status(201).setHeader('content-type', 'application/json')
                    .json(result.skills);
            }
            })
            .catch(error => {
                res.status(500).setHeader('content-type', 'application/json')
                    .json({error: "Unable to retrieve skills"});
        });
});

app.post('/skills', ensureLoggedIn, (req, res) => {
    const skillTitle = req.body.newSkillTitle;
    const skillDesc = req.body.newSkillDesc;
    const userId = req.session.user.user_id;
    model.addSkill(skillTitle, skillDesc, userId)
        .then(result => {
            if (result.error) {
                res.status(400).setHeader('content-type', 'application/json')
                    .json({error: "Unable to add skill."});
            } else {
                res.status(201).setHeader('content-type', 'application/json')
                    .json(result.skills);
            }
        })
        .catch(error => {
            res.status(500).setHeader('content-type', 'application/json')
                .json({error: "Unable to add skill."});
        });
});

app.post('/search-skill', ensureLoggedIn, (req, res) => {
    const userId = req.session.user.user_id;
    const searchName = req.body.skillName.trimStart().trimEnd().toLowerCase();
    model.findSkill(userId, searchName)
       .then(result => {
           if (result.error) {
               res.status(400).setHeader('content-type', 'application/json')
                   .json({error: `Skill ${req.body.skillName} not found.`});
           } else {
               res.status(201).setHeader('content-type', 'application/json')
                   .json(result);
           }
       })
       .catch(error => {
           res.status(500).setHeader('content-type', 'application/json')
               .json({error: "Internal server error."});
       });
});

app.put('/edit-skill/:skill_id', ensureLoggedIn, (req, res) => {
    const skillId = req.params.skill_id;
    const editSkillTitle = req.body.editSkillTitle;
    const editSkillDesc = req.body.editSkillDesc;
    model.editSkill(skillId, editSkillTitle, editSkillDesc)
        .then(result => {
            if (result.error) {
                res.status(400).setHeader('content-type', 'application/json')
                    .json({error: "Unable to edit skill."});
            } else {
                res.status(201).setHeader('content-type', 'application/json')
                    .json(result.skills);
            }
        })
        .catch(error => {
            res.status(500).setHeader('content-type', 'application/json')
                .json({error: "Unable to update skill"});
        });
});

app.delete('/skills/:skill_id', ensureLoggedIn, (req, res) => {
   const skillId = req.params.skill_id;
   const userId = req.session.user.user_id;
   model.deleteSkill(skillId, userId)
       .then(result => {
           if (result.error) {
               res.status(400).setHeader('content-type', 'application/json')
                   .json({error: "Unable to delete skill."});
           } else {
               res.status(204).setHeader('content-type', 'application/json')
                   .json(result.skills);
           }
       })
       .catch(error => {
           res.status(500).setHeader('content-type', 'application/json')
               .json({error: "Unable to delete skill: Internal Server Error"});
       });
});

app.get('/edit-profile/', ensureLoggedIn, (req, res) => {
   const userId = req.session.user.user_id;
    model.getUserData(userId)
        .then(result => {
            if (!result.error) {
                res.status(200).setHeader('content-type', 'application/json')
                    .json({user: result});
            } else {
                res.status(400).setHeader('content-type', 'application/json')
                    .json({error: "Unable to find user data."});
            }
        })
        .catch(error => {
            res.status(500).setHeader('content-type', 'application/json')
                .json({error: "Internal server error."});
        });
});

app.post('/edit-profile/:user_id', ensureLoggedIn, (req, res) => {
    const userId = req.params.user_id;
    const userFirstName = req.body.userFirstName;
    const userLastName = req.body.userLastName;
    const userEmail = req.body.userEmail;
    const newPassword = req.body.newPassword;

    // Does not continue if user supplied invalid new password
    if (newPassword !== '' && !isPasswordValid(newPassword)) {
        res.status(400).setHeader('content-type', 'application/json')
            .json({error: "Invalid password"});
    } else {
        model.editProfile(userId, userFirstName, userLastName, userEmail, newPassword)
            .then(result => {
                if (result.error) {
                    res.status(400).setHeader('content-type', 'application/json')
                        .json({error: "Unable to update profile"});
                } else {
                    res.status(201).setHeader('content-type', 'application/json')
                        .json(result);
                }
            })
            .catch(error => {
                res.status(500).setHeader('content-type', 'application/json')
                    .json({error: "Unable to update profile: Internal Server Error"});
            });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});
