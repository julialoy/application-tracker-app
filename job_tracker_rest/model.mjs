// bcrypt hash and check usage based on examples from bcryptjs documentation:
// https://github.com/dcodeIO/bcrypt.js/blob/master/README.md
import 'dotenv/config';
import { createRequire } from 'module';
import express from 'express';

const app = express();
app.use(express.json());

const require = createRequire(import.meta.url);
const bcrypt = require('bcryptjs');

const Pool = require('pg-pool');
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    ssl: { rejectUnauthorized: false },
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

// Insert each associated skill to the Skills_Jobs table
const insertSkills = async (skillId, jobId) => {
    const attachSkillQuery = {
        text: 'INSERT INTO "Skills_Jobs" ("Skills_skill_id", "Jobs_job_id") VALUES ($1, $2)',
        values: [skillId, jobId]
    };
    const result = await pool.query(attachSkillQuery);
    if (!result.rows) {
        return {error: `Unable to add skill ${skillId}`};
    }
    return result.rows;
}

// Finds skill id for given skill title
const getSkillId = async (skillTitle, userId) => {
    const getSkillIdQuery = {
        text: 'SELECT skill_id FROM "Skills" WHERE skill_title = $1 AND user_id = $2',
        values: [skillTitle, userId]
    };
    const result = await pool.query(getSkillIdQuery);
    if (result.rows) {
        return result.rows;
    } else {
        return {error: "Unable to find skill"};
    }
}

// Deletes all existing skills from a job in Skills_Jobs table
const deleteSkills = async (jobId) => {
    const deleteSkillsQuery = {
        text: 'DELETE FROM "Skills_Jobs" WHERE "Jobs_job_id" = $1 RETURNING *',
        values: [jobId]
    };
    const result =  await pool.query(deleteSkillsQuery);
    if (result.rows) {
        return result.rows[0];
    } else {
        return {error: "Unable to delete skills" };
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

// Calculates percent of jobs that are tagged with a particular skill and adds that
// property to skills object
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

// Creates new user and adds to database
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
        text: 'INSERT INTO "Users"(email, first_name, last_name, pass) ' +
            'VALUES($1, $2, $3, $4) RETURNING *',
        values: [userEmail, userFirstName, userLastName, hashedPass]
    };
    const result = await pool.query(addUserQuery);
    if (result.rows.length > 0) {
        return result.rows[0];
    } else {
        return {error: "Unable to create user."}
    }
}

// Find all jobs created by given user
const getJobs = async (userId) => {
    const getJobsByUserQuery = {
        text: 'SELECT * FROM "Jobs" WHERE user_id = $1',
        values: [userId]
    };
    const result = await pool.query(getJobsByUserQuery);
    if (result.rows) {
        return {jobs: result.rows};
    } else {
        return {error: "Unable to find jobs"};
    }
}

// Find all skills for specific job
const getJobSkills = async (userId, jobId) => {
    const findJobSkillsQuery = {
        text: 'SELECT "Jobs".job_id, ' +
            'ARRAY( ' +
            'SELECT "Skills".skill_title ' +
            'FROM "Skills" ' +
            'INNER JOIN "Skills_Jobs" ON "Skills".skill_id = "Skills_Jobs"."Skills_skill_id" ' +
            'WHERE "Skills_Jobs"."Jobs_job_id" = "Jobs".job_id' +
            ') AS skills FROM "Jobs" WHERE user_id = $1 AND job_id = $2',
        values: [userId, jobId]
    };
    const result = await pool.query(findJobSkillsQuery);
    if (result.rows.length > 0) {
        return {jobSkills: result.rows[0]}; // Send back the first (and only) result
    } else {
        return {error: "Skills for job not found"};
    }
}

// Retrieve specific job
const findJob = async (userId, jobId) => {
    const findJobQuery = {
        text: 'SELECT * FROM "Jobs" WHERE user_id = $1 AND job_id = $2',
        values: [userId, jobId]
    };
    const result = await pool.query(findJobQuery);
    if (result.rows.length > 0) {
        return result.rows[0];
    } else {
        return {error: "Job not found." };
    }
}

// Creates new job and adds to database
const addJob = async (jobTitle, company, location, status, dateApplied, notes, skills, userId) => {
    const addJobQuery = {
        text: 'INSERT INTO "Jobs" (job_title, company, location, status, date_applied, notes, user_id) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7) ' +
            'RETURNING *',
        values: [jobTitle, company, location, status, dateApplied, notes, userId]
    };
    const result = await pool.query(addJobQuery);
    if (result.rows) {
        const job = result.rows[0];
        const jobId = job.job_id;
        skills.forEach(skillId => {
            const insertResult = insertSkills(skillId, jobId);
            if (insertResult.error) {
                console.error(insertResult.error);
            }
        });
        return job;
    } else {
        return {error: "Unable to add job" };
    }
}

// Updates existing job in database
const editJob = async (jobTitle, company, location, status, dateApplied, notes, skills, jobId, userId) => {
    const editJobQuery = {
        text: 'UPDATE "Jobs" ' +
            'SET job_title = $1, company = $2, location = $3, status = $4, date_applied = $5, notes = $6 ' +
            'WHERE job_id = $7 AND user_id = $8',
        values: [jobTitle, company, location, status, dateApplied, notes, jobId, userId]
    };
    try {
        await pool.query(editJobQuery);
        await deleteSkills(jobId);              // Delete existing skills for job
        for (let skillTitle of skills) {
            let skillIdResult = await getSkillId(skillTitle, userId);
            if (skillIdResult.length > 0) {
                let skillId = skillIdResult[0].skill_id;
                await insertSkills(skillId, jobId);
            } else {
                console.error("Skill not found: ", skillTitle);
            }
        }
        return await findJob(userId, jobId);
    } catch (error) {
        return {error: "Unable to update job"};
    }
}

// Delete existing job from database
const deleteJob = async (jobId, userId) => {
    // No need to delete from "Skills_Jobs" table, will cascade on delete
    const deleteJobQuery = {
        text: 'DELETE FROM "Jobs" WHERE job_id = $1 AND user_id = $2 RETURNING *',
        values: [jobId, userId]
    };
    const result = await pool.query(deleteJobQuery);
    if (result.rows) {
        return result.rows[0];
    } else {
        return {error: "Unable to delete job"};
    }
}

// Find all contacts created by given user
const getContacts = async (userId) => {
    const getContactsByUserQuery = {
        text: 'SELECT * FROM "Contacts" WHERE user_id = $1',
        values: [userId]
    };
    const result = await pool.query(getContactsByUserQuery);
    if (result.rows) {
        return result.rows;
    } else {
        return {error: "Internal Server error"};
    }
}

// Creates a new contact for the given user
const addContact = async (firstName, lastName, email, company, notes, userId) => {
    const addContactQuery = {
        text: 'INSERT INTO "Contacts" (first_name, last_name, email, company, notes, user_id) ' +
            'VALUES ($1, $2, $3, $4, $5, $6) ' +
            'RETURNING *',
        values: [firstName, lastName, email, company, notes, userId]
    };
    const result = await pool.query(addContactQuery);
    if (result.rows) {
        return result.rows[0];
    } else {
        return {error: "Internal server error" };
    }
}

// Updates the given contact in the database
const editContact = async (firstName, lastName, email, company, notes, contactId, userId) => {
    const editContactQuery = {
        text: 'UPDATE "Contacts" ' +
            'SET first_name = $1, last_name = $2, email = $3, company = $4, notes = $5 ' +
            'WHERE contact_id = $6 AND user_id = $7 ' +
            'RETURNING *',
        values: [firstName, lastName, email, company, notes, contactId, userId]
    };
    const result = await pool.query(editContactQuery);
    if (result.rows) {
        return result.rows[0];
    } else {
        return {error: "Internal server error"};
    }
}

// Finds specific contact
const findContact = async (contactId, userId) => {
    const findContactQuery = {
        text: 'SELECT * FROM "Contacts" WHERE contact_id = $1 AND user_id = $2',
        values: [contactId, userId]
    };
    const result = await pool.query(findContactQuery);
    if (result.rows.length > 0) {
        return result.rows[0];
    } else {
        return {error: "Contact not found"};
    }
}

// Deletes given contact from database
const deleteContact = async (contactId, userId) => {
    const deleteContactQuery = {
        text: 'DELETE FROM "Contacts" WHERE contact_id = $1 AND user_id = $2 RETURNING *',
        values: [contactId, userId]
    };
    const result = await pool.query(deleteContactQuery);
    if (result.rows) {
        return result.rows;
    } else {
        return {error: "Unable to delete contact"};
    }
}

// Finds all skills with titles that contain the search string provided
// by the user; case insensitive
const findSkill = async (userId, searchName) => {
    const findSkillQuery = {
        text: 'SELECT * FROM "Skills" WHERE user_id = $1 AND LOWER(skill_title) LIKE $2',
        values: [userId, '%' + searchName + '%']
    };
    const result = await pool.query(findSkillQuery);
    if (result.rows) {
        await countJobsPerSkill(result.rows);
        await percentJobsPerSkill(userId, result.rows);
        return result.rows;
    } else {
        return {error: "Unable to find skill."};
    };
}

// Find all skills created by given user
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

// Add new skill to database
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

// Update existing skill in database
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

// Delete given skill from database
const deleteSkill = async (skillId, userId) => {
    const deleteSkillQuery = {
        text: 'DELETE FROM "Skills" WHERE skill_id = $1 AND user_id = $2 RETURNING *',
        values: [skillId, userId]
    }
    const result = await pool.query(deleteSkillQuery);
    if (result.rows) {
        return result.rows[0];
    } else {
        return {error: "Unable to delete skill"};
    }
}

// Edit user information in database
const editProfile = async (userId, userFirstName, userLastName, userEmail, newPassword) => {
    // Ensure password is not set to an empty string if user is not updating password
    let editUserQuery;
    if (newPassword !== '') {
        const hashedPass = await bcrypt.hash(newPassword, 10);
        editUserQuery = {
            text: 'UPDATE "Users" ' +
                'SET first_name = $2, last_name = $3, email = $4, pass = $5 ' +
                'WHERE user_id = $1 ' +
                'RETURNING "user_id", "first_name", "last_name", "email"',
            values: [userId, userFirstName, userLastName, userEmail, hashedPass]
        }
    } else {
        editUserQuery = {
            text: 'UPDATE "Users" ' +
                'SET first_name = $2, last_name = $3, email = $4 ' +
                'WHERE user_id = $1 ' +
                'RETURNING "user_id", "first_name", "last_name", "email"',
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

// Retrieve user information
const getUserData = async (userId) => {
    const userQuery = {
        text: 'SELECT "user_id", "first_name", "last_name", "email" ' +
            'FROM "Users" ' +
            'WHERE user_id = $1',
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
    pool, addContact, addJob, addSkill, addUser, authenticateUser, deleteContact, deleteJob,
    deleteSkill, editContact, editJob, editSkill, findContact, findJob, findSkill, getContacts,
    getJobs, getJobSkills, getSkills, getUserData, editProfile
};
