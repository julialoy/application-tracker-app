// bcrypt hash and check functions based on examples from bcryptjs documentation:
// https://github.com/dcodeIO/bcrypt.js/blob/master/README.md
import 'dotenv/config';
import { createRequire } from 'module';
import express from 'express';

const app = express();
app.use(express.json());

const require = createRequire(import.meta.url);
const bcrypt = require('bcryptjs');

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
        'SELECT * FROM "Users" WHERE email = $1',
        [username]);
    if (result.rows.length > 0) {
        const checkPass = await bcrypt.compare(password, result.rows[0].pass);
        if (checkPass) {
            return result.rows[0]; // return the user if found
        } else {
            return null;
        }
    } else {
        return null; // or some other value to indicate no user found
    }
}

// Returns NUMBER of total jobs found for a single user in DB
const getNumJobs = async (userId) => {
    const getJobsQuery = {
        text: 'SELECT * FROM "Jobs" WHERE user_id = $1',
        values: [userId]
    }
    const result = await pool.query(getJobsQuery);
    return result.rows.length;
}

// Returns all jobs tagged with given skill id
const getJobsPerSkill = async (skillId) => {
    const jobsPerSkillQuery = {
        text: 'SELECT * FROM "Skills_Jobs" WHERE "Skills_skill_id" = $1',
        values: [skillId]
    }
    return await pool.query(jobsPerSkillQuery);
}

// Calculates number of jobs each skill is tagged in and adds that property to skills object
const countJobsPerSkill = async (skills) => {
    for (let i = 0; i < skills.length; i++) {
        let currSkillId = skills[i].skill_id;
        const result = await getJobsPerSkill(currSkillId);
        if (result.rows) {
            skills[i].num_jobs = result.rows.length
        } else {
            skills[i].num_jobs = 0;
        }
    }
}

// Calculates percent of jobs that are tagged with a particular skill and adds that property to skills object
const percentJobsPerSkill = async (userId, skills) => {
    const totalUserJobs = await getNumJobs(userId);
    for (let i = 0; i < skills.length; i++) {
        let currSkillId = skills[i].skill_id;
        const result = await getJobsPerSkill(currSkillId);
        if (result.rows) {
            skills[i].percent_jobs = Math.round((result.rows.length / totalUserJobs) * 100);
        }
    }
}

const addUser = async (userEmail, userFirstName, userLastName, userPass) => {
    // Returns error if user tries to register same email more than once
    const getUserByEmailQuery = {
        text: 'SELECT * FROM "Users" WHERE email = $1',
        values: [userEmail]
    };
    const existsResult = await pool.query(getUserByEmailQuery);
    if (existsResult.rows.length > 0) {
        return {error: "User already exists."};
    }

    const hashedPass = await bcrypt.hash(userPass, 10);
    const addUserQuery = {
        text: 'INSERT INTO "Users"(email, first_name, last_name, pass) VALUES($1, $2, $3, $4) RETURNING *',
        values: [userEmail, userFirstName, userLastName, hashedPass]
    };
    const result = await pool.query(addUserQuery);
    if (result.rows.length > 0) {
        return result.rows[0];
    } else {
        return {error: "Unable to create user."}
    }
}

// Finds all skills with titles that contain the search string provided
// by the user; case insensitive
const findSkill = async (userId, searchName) => {
    console.log(`Finding skill: ${searchName}, user ${userId}`);
    const findSkillQuery = {
        text: 'SELECT * FROM "Skills" WHERE user_id = $1 AND LOWER(skill_title) LIKE $2',
        values: [userId, '%' + searchName + '%']
    }
    console.log(`QUERY: ${findSkillQuery.text} ${findSkillQuery.values}`);
    const result = await pool.query(findSkillQuery);
    console.log(`RESULT: ${result}`);
    if (result.rows) {
        console.log(`Original result: ${result.rows}`);
        await countJobsPerSkill(result.rows);
        console.log(`Count jobs result: ${result.rows}`);
        await percentJobsPerSkill(userId, result.rows);
        console.log(`Percent jobs result: ${result.rows}`);
        return result.rows;
    } else {
        console.log("Can't get skill");
        return {error: "Unable to find skill."};
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

const editProfile = async (userId, userFirstName, userLastName, userEmail, newPassword) => {
    // Ensure password is not set to an empty string if user is not updating password
    let editUserQuery;
    if (newPassword !== '') {
        const hashedPass = await bcrypt.hash(newPassword, 10);
        editUserQuery = {
            text: 'UPDATE "Users" SET first_name = $2, last_name = $3, email = $4, pass = $5 WHERE user_id = $1 RETURNING "user_id", "first_name", "last_name", "email"',
            values: [userId, userFirstName, userLastName, userEmail, hashedPass]
        }
    } else {
        editUserQuery = {
            text: 'UPDATE "Users" SET first_name = $2, last_name = $3, email = $4 WHERE user_id = $1 RETURNING "user_id", "first_name", "last_name", "email"',
            values: [userId, userFirstName, userLastName, userEmail]
        }
    }
    const result = await pool.query(editUserQuery);
    if (result.rows) {
        return result.rows[0];
    } else {
        return {error: "Unable to edit profile."};
    }
}

const getUserData = async (userId) => {
    const userQuery = {
        text: 'SELECT "user_id", "first_name", "last_name", "email" FROM "Users" WHERE user_id = $1',
        values: [userId]
    }
    const result = await pool.query(userQuery);
    if (result.rows) {
        return result.rows[0];
    } else {
        return {error: "Unable to find user."};
    }
}

export {
    pool, addSkill, addUser, authenticateUser,
    deleteSkill, editSkill, findSkill, getSkills, getUserData, editProfile
};
