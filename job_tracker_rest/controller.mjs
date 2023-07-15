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
      next();
      console.log("User is logged in");
      console.log(req.session.user.user_id);
    } else {
      // User is not logged in
      // Send an error response or redirect to a login page
      res.status(401).json({ error: 'User not logged in' });
    }
  }

// Routes here
app.post('/register', (req, res) => {
   const email = req.body.email;
   const username = req.body.email;             // Using email for both username and email fields
   const userpass = req.body.pword;
   const userpassConfirm = req.body.pwordConfirm;
   if (isPasswordValid(userpass, userpassConfirm)) {
       model.addUser(username, userpass, email)
           .then(result => {
               res.status(201).setHeader('content-type', 'application/json')
                   .json(result);
           })
           .catch(error => {
            console.error(error);
               res.status(500).setHeader('content-type', 'application/json')
                   .json({Error: "Unable to complete registration"});
           });
   } else {
       res.status(400).setHeader('content-type', 'applicaiton/json')
           .json({Error: "Invalid password supplied"});
   }
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    console.log(`Username: ${username}, Password: ${password}`); // Logging the username and password

    try {
        model.authenticateUser(username, password)
            .then(user => {
                if (user) {
                    req.session.user = user;
                    res.redirect('/');
                } else {
                    res.status(400).json({ Error: 'Authentication failed.' });
                }
            })
            .catch(err => {
                console.error(`Error during authentication: ${err}`); // Logging error during authentication
                res.status(500).json({ Error: 'Server error.' });
            });
    } catch (err) {
        console.error(`Caught exception: ${err}`); // Logging any caught exceptions
        res.status(500).json({ Error: 'Server error.' });
    }
});


app.get('/', (req, res) => {
    res.render('home');
});

// Fetch all jobs for the logged in user
app.get('/jobs', ensureLoggedIn, (req, res) => {
    const user_id = req.session.user.user_id;

    model.pool.query(
        'SELECT * FROM jobs WHERE user_id = $1',
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

// Create a new job
app.post('/jobs', ensureLoggedIn, (req, res) => {
    const { title, company, location, status, skills, date, notes } = req.body;
    const user_id = req.session.user.user_id;

    model.pool.query(
        'INSERT INTO jobs (title, company, location, status, skills, date, notes, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [title, company, location, status, skills, date, notes, user_id],
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

// Update an existing job
app.put('/jobs/:id', ensureLoggedIn, (req, res) => {
    const { id } = req.params;
    const { title, company, location, status, skills, date, notes } = req.body;
    const user_id = req.session.user.user_id;

    model.pool.query(
        'UPDATE jobs SET title = $1, company = $2, location = $3, status = $4, skills = $5, date = $6, notes = $7 WHERE id = $8 AND user_id = $9',
        [title, company, location, status, skills, date, notes, id, user_id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.status(200).json({ status: 'success', message: 'Job updated' });
            }
        }
    );
});

// Delete an existing job
app.delete('/jobs/:id', ensureLoggedIn, (req, res) => {
    const { id } = req.params;
    const user_id = req.session.user.user_id;

    model.pool.query(
        'DELETE FROM jobs WHERE id = $1 AND user_id = $2',
        [id, user_id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.status(200).json({ status: 'success', message: 'Job deleted' });
            }
        }
    );
});


app.get('/skills', (req, res) => {
    res.render('skills');
});

app.get('/contacts', (req, res) => {
    const user_id = req.session.user.user_id;

    model.pool.query(
        'SELECT * FROM contacts WHERE user_id = $1',
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

app.post('/pages/contacts',ensureLoggedIn,(req, res) => {
    const { name, phone, email, company, notes } = req.body;
    const user_id = req.session.user.user_id;

    model.pool.query(
      'INSERT INTO contacts (name, phone, email, company, notes, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, phone, email, company, notes, user_id],
      (error, results) => {
        if (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal server error' });
        } else {
          res.status(200).json(results.rows[0]);
        }
      }
    );
});

app.put('/pages/contacts/:id', ensureLoggedIn,(req, res) => {
    const { id } = req.params;
    const { name, phone, email, company, notes } = req.body;
    const user_id = req.session.user.user_id;

    model.pool.query(
        'UPDATE contacts SET name = $1, phone = $2, email = $3, company = $4, notes = $5 WHERE id = $6 AND user_id = $7',
        [name, phone, email, company, notes, id, user_id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.status(200).json({ status: 'success', message: 'Contact updated' });
            }
        }
    );
});

app.delete('/pages/contacts/:id',ensureLoggedIn, (req, res) => {
    const { id } = req.params;
    const user_id = req.session.user.user_id;

    model.pool.query(
        'DELETE FROM contacts WHERE id = $1 AND user_id = $2',
        [id, user_id],
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


app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});

