import 'dotenv/config';
import { createRequire } from 'module';

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

// test postgresql connection and print out error if connection fails
const testConnection = async () => {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log(res.rows[0]);
        return true;
    } catch(err) {
        console.error(`Error testing the database connection: ${err.stack}`);
        return false;
    }
};

// Call the function
testConnection();

const authenticateUser = async (username, password) => {
    const result = await pool.query(
        'SELECT * FROM Users WHERE email = $1 AND pass = $2',
        [username, password]
    );

    if (result.rows.length > 0) {
        return result.rows[0];
    } else {
        return null;
    }
};


const addUser = async (username, userPass, userEmail) => {
    const result = await pool.query('INSERT INTO Users(username, pass, email) VALUES ($1, $2, $3) RETURNING *',
        [username, userPass, userEmail]);
    return (result.rows.length > 0);
}

export { pool, addUser, authenticateUser };