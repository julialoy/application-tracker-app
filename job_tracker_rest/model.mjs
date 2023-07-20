import 'dotenv/config';
import { createRequire } from 'module';
import express from 'express';
const app = express();
app.use(express.json());

const require = createRequire(import.meta.url);
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    max: 10
});

const authenticateUser = async (username, password) => {
    const result = await pool.query(
        'SELECT * FROM "Users" WHERE email = $1 AND pass = $2',
        [username, password]);
    if (result.rows.length > 0) {
        return result.rows[0]; // return the user if found
    } else {
        return null; // or some other value to indicate no user found
    }
    }


const addUser = async (userEmail, userFirstName, userLastName, userPass) => {
    const findUserQuery = {
        text: 'SELECT * FROM "Users" where email = $1',
        values: [userEmail],
        rowMode: 'array'
    };
    const existsResult = await pool.query(findUserQuery);
    if (existsResult.rows.length > 0) {
        return {error: "User already exists."};
    }

    const addUserQuery = {
        text: 'INSERT INTO "Users"(email, first_name, last_name, pass) VALUES($1, $2, $3, $4) RETURNING *',
        values: [userEmail, userFirstName, userLastName, userPass],
        rowMode: 'array'
    };
    const result = await pool.query(addUserQuery);
    if (result.rows.length > 0) {
        return {user: result.rows[0]};
    } else {
        return {error: "Unable to create user."}
    }
}



app.get('/skills', (req, res) => {
    res.render('skills');
});


export { pool, addUser,authenticateUser};