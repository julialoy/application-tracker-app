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

// Calculates number of jobs each skill is tagged in and adds that property to skills object
const countJobsPerSkill = async (skills) => {
    for (let i = 0; i < skills.length; i++) {
        let currSkillId = skills[i].skill_id;
        const getNumJobsPerSkill = {
            text: 'SELECT * FROM "Skills_Jobs" WHERE "Skills_skill_id" = $1',
            values: [currSkillId]
        }
        const result = await pool.query(getNumJobsPerSkill);
        if (result.rows) {
            skills[i].num_jobs = result.rows.length
        } else {
            skills[i].num_jobs = 0;
        }
    }
}

const addUser = async (userEmail, userFirstName, userLastName, userPass) => {
    const getUserByEmailQuery = {
        text: 'SELECT * FROM "Users" WHERE email = $1',
        values: [userEmail]
    };
    const existsResult = await pool.query(getUserByEmailQuery);
    if (existsResult.rows.length > 0) {
        return {error: "User already exists."};
    }

    const addUserQuery = {
        text: 'INSERT INTO "Users"(email, first_name, last_name, pass) VALUES($1, $2, $3, $4) RETURNING *',
        values: [userEmail, userFirstName, userLastName, userPass]
    };
    const result = await pool.query(addUserQuery);
    if (result.rows.length > 0) {
        console.log("REGISTERED: ", result.rows[0]);
        return result.rows[0];
    } else {
        return {error: "Unable to create user."}
    }
}

const getSkills = async (userId) => {
    const getSkillsByUserQuery = {
        text: 'SELECT * FROM "Skills" WHERE user_id = $1',
        values: [userId]
    };
    const result = await pool.query(getSkillsByUserQuery);
    if (result.rows) {
        await countJobsPerSkill(result.rows);   // Add num_jobs property to each skill
        return {skills: result.rows};
    } else {
        return {error: "Unable to retrieve skills."};
    }
}

const addSkill = async (skillTitle, skillDesc, userId) => {
    const addSkillQuery = {
        text: 'INSERT INTO "Skills"(skill_title, skill_desc,user_id) VALUES($1, $2, $3) RETURNING *',
        values: [skillTitle, skillDesc, userId]
    };
    const result = await pool.query(addSkillQuery);
    if (result.rows.length > 0) {
        return {skills: result.rows[0]};
    } else {
        return {error: "Unable to add skill."};
    }
}

const editSkill = async (skillId, editedSkillTitle, editedSkillDesc) => {
    const editSkillQuery = {
        text: 'UPDATE "Skills" SET skill_title = $2, skill_desc = $3 WHERE skill_id = $1 RETURNING *',
        values: [skillId, editedSkillTitle, editedSkillDesc]
    }
    const result = await pool.query(editSkillQuery);
    if (result.rows) {
        return {skills: result.rows};
    } else {
        return {error: "Unable to update skill"};
    }
}

const deleteSkill = async (skillId) => {
    const deleteSkillQuery = {
        text: 'DELETE FROM "Skills" WHERE skill_id = $1 RETURNING *',
        values: [skillId]
    }
    const result = await pool.query(deleteSkillQuery);
    if (result.rows) {
        return result.rows[0];
    } else {
        return {error: "Unable to delete skill"};
    }
}

export { pool, addSkill, addUser, authenticateUser, deleteSkill, editSkill, getSkills};
