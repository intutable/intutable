-- clean slate for unit tests, do not copy this
DROP TABLE IF EXISTS columns;
DROP TABLE IF EXISTS roles_projects;
DROP TABLE IF EXISTS userprojects;
DROP TABLE IF EXISTS projects_tables;
DROP TABLE IF EXISTS projecttables;
DROP TABLE IF EXISTS tables;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

DROP TABLE IF EXISTS view_columns;
DROP TABLE IF EXISTS view_joins;
DROP TABLE IF EXISTS views;


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
-- end project-management schema

-- begin lazy-views schema
CREATE TABLE views(
    _id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    base_id INTEGER NOT NULL,
    base_type INTEGER NOT NULL,
    user_id INTEGER NULL,
    row_options TEXT NOT NULL
);

CREATE TABLE view_joins(
    _id SERIAL PRIMARY KEY,
    view_id INTEGER NOT NULL,
    base_id INTEGER NOT NULL,
    base_type INTEGER NOT NULL,
    "on" TEXT NOT NULL
);

CREATE TABLE view_columns(
    _id SERIAL PRIMARY KEY,
    view_id INTEGER NOT NULL,
    join_id INTEGER NULL,
    -- parent column whose data this column inherits
    column_id INTEGER NOT NULL,
    function TEXT NULL
);
-- end lazy-views schema

-- changes with PM version 2.0.0 (think "role" instead of "user"; extract
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

-- example user and project for the unit tests
INSERT INTO roles(name) VALUES('nick@baz.org');
INSERT INTO projects(project_name, owner_id) VALUES('project1', 1);
INSERT INTO roles_projects(role_id, project_id) VALUES(1, 1);


-- changes with version 7.0.0 (introduce join pre-group option)
ALTER TABLE view_joins ADD COLUMN pre_group INTEGER NOT NULL DEFAULT 0;
UPDATE view_joins SET pre_group=0;
-- end 7.0.0 changes
