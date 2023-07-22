// Unit tests for Register User
import { createRequire } from 'module';
import { addUser, pool } from '../model.mjs';

const require = createRequire(import.meta.url);
const assert = require('chai').assert;
const expect = require('chai').expect;

beforeEach(async function() {
    const reset = {
        text: 'DELETE FROM "Users"'
    };
    await pool.query(reset);
});

// Mocha doesn't play nicely with arrow functions due to the lexical binding of 'this'
describe('User', function() {
    describe('#register', function() {
        const newUser = {
            email: 'jenyschmoe@fakeemail.com',
            pword: 'mypassword123',
            pwordConfirm: 'mypassword123',
            firstName: 'Jeny',
            lastName: 'Schmoe'
        };

        it('User is returned', async function() {
            const result = await addUser(
                newUser.email,
                newUser.firstName,
                newUser.lastName,
                newUser.pword
            );
            expect(result).to.have.property('user');
        });

        it('User contains expected data', async function() {
            const result = await addUser(
                newUser.email,
                newUser.firstName,
                newUser.lastName,
                newUser.pword
            );
            expect(result.user[1]).to.equal(newUser.email);
            expect(result.user[2]).to.equal(newUser.firstName);
            expect(result.user[3]).to.equal(newUser.lastName);
            expect(result.user[4]).to.equal(newUser.pword);
        });

        it('User id of returned user is a number', async function() {
            const result = await addUser(
                newUser.email,
                newUser.firstName,
                newUser.lastName,
                newUser.pword
            );
            expect(result.user[0]).to.be.a('number');
        });

        it('Registration adds a user to DB', async function() {
            await addUser(
                newUser.email,
                newUser.firstName,
                newUser.lastName,
                newUser.pword
            );
            const searchQuery = {
                text: 'SELECT * FROM "Users" WHERE email = $1',
                values: [newUser.email],
                rowMode: 'array'
            }
            const queryResult = pool.query(searchQuery);
            expect(queryResult.rows).to.have.lengthOf(1);
        })
    })
});

