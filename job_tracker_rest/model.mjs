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

export { addUser };