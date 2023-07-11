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

const addUser = async (username, userPass, userEmail) => {
    const result = await pool.query('INSERT INTO Users(username, pass, email) VALUES ($1, $2, $3) RETURNING *',
        [username, userPass, userEmail]);
    return (result.rows.length > 0);
}

export { addUser };