DROP  TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS jobs;

CREATE TABLE companies (
    handle TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    num_employees INTEGER,
    description TEXT,
    logo_url TEXT
);

CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    salary FLOAT NOT NULL,
    equity FLOAT NOT NULL CHECK ((equity >= 0) AND (equity <= 1)),
    company_handle TEXT NOT NULL REFERENCES companies ON DELETE CASCADE,
    date_posted timestamp WITH time zone NOT NULL DEFAULT CURRENT_DATE
)