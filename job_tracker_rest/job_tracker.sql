CREATE TABLE IF NOT EXISTS Users (
    user_id SERIAL NOT NULL UNIQUE PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    pass VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name TEXT,
    phone TEXT,
    email TEXT,
    company TEXT,
    notes TEXT,
    user_id INTEGER REFERENCES Users(user_id)
);

CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    skills VARCHAR(255),
    date VARCHAR(255),
    notes VARCHAR(255),
    user_id INTEGER REFERENCES Users(user_id)
);