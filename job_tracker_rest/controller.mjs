import 'dotenv/config';
import * as model from './model.mjs';
import express from 'express';

// Set up environment and constants
const PORT = process.env.PORT;
const app = express();
app.use(express.json());

// Validation logic here
const isPasswordValid = (pword, pwordConfirm) => {
    // Additional validation logic can be incorporated here
    // at later steps, e.g., requiring uppercase, symbols, etc.
    return (pword === pwordConfirm && pword.length >= 8);
};

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
                   res.status(201).setHeader('content-type', 'application/json')
                       .json(result.user);
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

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});

