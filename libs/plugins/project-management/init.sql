-- clean slate for unit tests
DROP TABLE IF EXISTS columns;
DROP TABLE IF EXISTS tables;
DROP TABLE IF EXISTS projecttables;
DROP TABLE IF EXISTS userprojects;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS roles_projects;
DROP TABLE IF EXISTS projects_tables;

-- the following schema must be present in the database when using this plugin.
-- begin schema
CREATE TABLE users(
    _id SERIAL PRIMARY KEY,
    email TEXT,
    password TEXT
);
CREATE TABLE projects(
    _id SERIAL PRIMARY KEY,
    "projectName" TEXT,
    "ownerId" INTEGER,
    FOREIGN KEY("ownerId") REFERENCES users(_id)
);
CREATE TABLE userprojects(
    _id SERIAL PRIMARY KEY,
    "userId" INTEGER,
    "projectId" INTEGER,
    FOREIGN KEY("userId") REFERENCES users(_id),
    FOREIGN KEY("projectId") REFERENCES projects(_id)
);
CREATE TABLE tables(
    _id SERIAL PRIMARY KEY,
    key TEXT NOT NULL,
    name TEXT,
    "ownerId" INTEGER,
    FOREIGN KEY("ownerId") REFERENCES users(_id)
);
CREATE TABLE projecttables(
    _id SERIAL PRIMARY KEY,
    "projectId" INTEGER,
    "tableId" INTEGER,
    FOREIGN KEY("projectId") REFERENCES projects(_id),
    FOREIGN KEY("tableId") REFERENCES tables(_id)
);
CREATE TABLE columns(
    _id SERIAL PRIMARY KEY,
    "columnName" TEXT,
    "tableId" INTEGER,
    type TEXT default 'string' NOT NULL,
    editable INTEGER DEFAULT 1 NOT NULL,
    FOREIGN KEY("tableId") REFERENCES tables(_id)
);
-- end schema

-- changes with version 2.0.0 (think "role" instead of "user"; extract
-- authentication)
ALTER TABLE userprojects RENAME COLUMN "userId" TO role_id;
ALTER TABLE users RENAME TO roles;
ALTER TABLE userprojects RENAME TO roles_projects;
ALTER TABLE projecttables RENAME TO projects_tables;
ALTER TABLE roles RENAME email to name;
-- also get rid of all camel case for good
ALTER TABLE roles_projects RENAME COLUMN "projectId" to project_id;
ALTER TABLE projects_tables RENAME COLUMN "projectId" to project_id;
ALTER TABLE projects RENAME COLUMN "projectName" to project_name;
ALTER TABLE projects RENAME COLUMN "ownerId" to owner_id;
ALTER TABLE tables RENAME COLUMN "ownerId" to owner_id;
ALTER TABLE projects_tables RENAME COLUMN "tableId" to table_id;
ALTER TABLE columns RENAME COLUMN "tableId" to table_id;
ALTER TABLE columns RENAME COLUMN "columnName" to column_name;
-- end 2.0.0 changes

INSERT INTO roles (_id, name) VALUES (1, 'nick@baz.org');
