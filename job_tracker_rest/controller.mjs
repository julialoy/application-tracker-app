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
               res.status(500).setHeader('content-type', 'application/json')
                   .json({Error: "Unable to complete registration"});
           });
   } else {
       res.status(400).setHeader('content-type', 'applicaiton/json')
           .json({Error: "Invalid password supplied"});
   }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});

