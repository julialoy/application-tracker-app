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

// Validation logic here
const isPasswordValid = (pword, pwordConfirm) => {
    // Additional validation logic can be incorporated here
    // at later steps, e.g., requiring uppercase, symbols, etc.
    return (pword === pwordConfirm && pword.length >= 8);
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
   const userpassConfirm = req.body.pwordConfirm;
   if (isPasswordValid(userpass, userpassConfirm)) {
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
           .json({error: "Invalid password supplied"});
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
    const user_id = req.session.user.user_id;
    console.log(user_id);

    model.pool.query(
        'SELECT * FROM "Jobs" WHERE user_id = $1',
        [user_id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.status(200).json(results.rows);
            }
        }
    );
});

// Fetch skills for a specific job
app.get('/jobs/:job_id/skills', ensureLoggedIn, (req, res) => {
    const { job_id } = req.params;
    const user_id = req.session.user.user_id;

    model.pool.query(
        `SELECT "Jobs".job_id, 
                ARRAY(
                    SELECT "Skills".skill_title
                    FROM "Skills" 
                    INNER JOIN "Skills_Jobs" ON "Skills".skill_id = "Skills_Jobs"."Skills_skill_id"
                    WHERE "Skills_Jobs"."Jobs_job_id" = "Jobs".job_id
                ) AS skills
         FROM "Jobs" WHERE user_id = $1 AND job_id = $2`,
        [user_id, job_id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                if (results.rows.length > 0) {
                    res.status(200).json(results.rows[0]); // Send back the first (and only) result
                } else {
                    res.status(404).json({ message: 'Job not found' });
                }
            }
        }
    );
});

app.get('/jobs/:job_id', ensureLoggedIn, (req, res) => {
    const { job_id } = req.params;
    const user_id = req.session.user.user_id;

    model.pool.query(
        'SELECT * FROM "Jobs" WHERE user_id = $1 AND job_id = $2',
        [user_id, job_id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                if (results.rows.length > 0) {
                    res.status(200).json(results.rows[0]);
                } else {
                    res.status(404).json({ message: 'Job not found' });
                }
            }
        }
    );
});

// Create a new job
app.post('/jobs', ensureLoggedIn, (req, res) => {
    const { job_title, company, location, status, date_applied, notes, skills } = req.body;
    const user_id = req.session.user.user_id;

    model.pool.query(
        'INSERT INTO "Jobs" (job_title, company, location, status, date_applied, notes, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [job_title, company, location, status, date_applied, notes, user_id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                const job = results.rows[0];
                const jobId = job.job_id;
                
                // Insert each associated skill to the Skills_Jobs table
                skills.forEach(skillId => {
                    model.pool.query(
                        'INSERT INTO "Skills_Jobs" ("Skills_skill_id", "Jobs_job_id") VALUES ($1, $2)',
                        [skillId, jobId],
                        (error, results) => {
                            if (error) {
                                console.error(error);
                            }
                        }
                    );
                });

                res.status(201).json(job);
            }
        }
    );
});

// Update an existing job
app.put('/jobs/edit/:job_id', ensureLoggedIn, async (req, res) => {
    const { job_id } = req.params;
    const { job_title, company, location, status, date_applied, notes, skills } = req.body;
    const user_id = req.session.user.user_id;

    try {
        // Update job in Jobs table
        await model.pool.query(
            'UPDATE "Jobs" SET job_title = $1, company = $2, location = $3, status = $4, date_applied = $5, notes = $6 WHERE job_id = $7 AND user_id = $8',
            [job_title, company, location, status, date_applied, notes, job_id, user_id]
        );

        // Delete existing skills for this job in Skills_Jobs table
        await model.pool.query(
            'DELETE FROM "Skills_Jobs" WHERE "Jobs_job_id" = $1',
            [job_id]
        );

        // Add new skills for this job in Skills_Jobs table
        for (let skillTitle of skills) {
            const result = await model.pool.query(
                'SELECT skill_id FROM "Skills" WHERE skill_title = $1',
                [skillTitle]
            );
            
            if(result.rows.length > 0){
                let skillId = result.rows[0].skill_id;
                await model.pool.query(
                    'INSERT INTO "Skills_Jobs" ("Skills_skill_id", "Jobs_job_id") VALUES ($1, $2)',
                    [skillId, job_id]
                );
            } else {
                console.error("Skill not found: ", skillTitle);
                // Handle the error or continue with other skills
            }
        }

        // Fetch the updated job
        const results = await model.pool.query(
            'SELECT * FROM "Jobs" WHERE job_id = $1 AND user_id = $2',
            [job_id, user_id]
        );

        console.log("Updated job: ", results.rows[0]);
        res.status(200).json(results.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Delete an existing job
app.delete('/jobs/:job_id', ensureLoggedIn, (req, res) => {
    const { job_id } = req.params;
    const user_id = req.session.user.user_id;

    // Delete from Skills_Jobs table
    model.pool.query(
        'DELETE FROM "Skills_Jobs" WHERE "Jobs_job_id" = $1',
        [job_id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                // Delete from Jobs table
                model.pool.query(
                    'DELETE FROM "Jobs" WHERE job_id = $1 AND user_id = $2',
                    [job_id, user_id],
                    (error, results) => {
                        if (error) {
                            console.error(error);
                            res.status(500).json({ error: 'Internal server error' });
                        } else {
                            res.status(200).json({ status: 'success', message: 'Job deleted' });
                        }
                    }
                );
            }
        }
    );
});

app.get('/contacts', (req, res) => {
    const user_id = req.session.user.user_id;

    model.pool.query(
        'SELECT * FROM "Contacts" WHERE user_id = $1',
        [user_id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.status(200).json(results.rows);
            }
        }
    );
});

app.post('/contacts',ensureLoggedIn,(req, res) => {
    const { first_name, last_name, email, company, notes } = req.body;
    const user_id = req.session.user.user_id;

    model.pool.query(
      'INSERT INTO "Contacts" (first_name, last_name, email, company, notes, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [first_name, last_name, email, company, notes, user_id],
      (error, results) => {
        if (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal server error' });
        } else {
          res.status(201).json(results.rows[0]);
        }
      }
    );
});

app.put('/contacts/edit/:contact_id', ensureLoggedIn,(req, res) => {
    const { contact_id } = req.params;
    const { first_name, last_name, email, company, notes } = req.body;
    const user_id = req.session.user.user_id;

    model.pool.query(
        'UPDATE "Contacts" SET first_name = $1, last_name = $2, email = $3, company = $4, notes = $5 WHERE contact_id = $6 AND user_id = $7',
        [first_name, last_name, email, company, notes, contact_id, user_id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                model.pool.query(
                    'SELECT * FROM "Contacts" WHERE contact_id = $1 AND user_id = $2',
                    [contact_id, user_id],
                    (error, results) => {
                        if (error) {
                            console.error(error);
                            res.status(500).json({ error: 'Internal server error' });
                        } else {
                            console.log("Updated contact: ", results.rows[0]);
                            res.status(200).json(results.rows[0]);
                        }
                    }
                );
            }
        }
    );
});

app.get('/contacts/:contact_id', ensureLoggedIn, (req, res) => {
    const { contact_id } = req.params;
    const user_id = req.session.user.user_id;

    model.pool.query(
        'SELECT * FROM "Contacts" WHERE contact_id = $1 AND user_id = $2',
        [contact_id, user_id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                if (results.rows.length > 0) {
                    res.status(200).json(results.rows[0]);
                } else {
                    res.status(404).json({ error: 'Contact not found' });
                }
            }
        }
    );
});

app.delete('/contacts/:contact_id',ensureLoggedIn, (req, res) => {
    const { contact_id } = req.params;
    const user_id = req.session.user.user_id;

    model.pool.query(
        'DELETE FROM "Contacts" WHERE contact_id = $1 AND user_id = $2',
        [contact_id, user_id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.status(200).json({ status: 'success', message: 'Contact deleted' });
            }
        }
    );
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

app.post('/edit-skill/:skill_id', ensureLoggedIn, (req, res) => {
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
   model.deleteSkill(skillId)
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
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});
