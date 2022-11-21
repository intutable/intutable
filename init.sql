-- begin project-management schema
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
    function TEXT NULL,
    -- custom metadata, see types/rdg.ts for explanations on them
    -- isUserPrimaryKey: a designated column that is shown to the user
    -- as a sort of primary key,
    -- for example to create short previews of records. Is distinct from the
    -- actual primary key, of course.
    "isUserPrimaryKey" INTEGER DEFAULT 0 NOT NULL,
    -- kinds of columns: plain data (text, date, ...), link to another table,
    -- non-editable row index column ...
    kind TEXT NOT NULL DEFAULT 'standard',
    -- type of the content of a column (string, date, currency, ...)
    "cellType" TEXT NOT NULL,
    "hidden" INTEGER NOT NULL DEFAULT 0,
    "displayName" TEXT NULL,
    -- column index
    "index" INTEGER NULL,
    -- flag for internal (i.e. managed by the app, not the user) columns
    "isInternal" INTEGER DEFAULT 0 NOT NULL,
    -- various RDG props
    editable INTEGER DEFAULT 1,
    editor TEXT NULL,
    formatter TEXT NUll,
    width VARCHAR(32) NULL,
    "minWidth" VARCHAR(32) NULL,
    "maxWidth" VARCHAR(32) NULL,
    "cellClass" VARCHAR(255) NULL,
    "headerCellClass" VARCHAR(255) NULL,
    "summaryCellClass" VARCHAR(255) NULL,
    "summaryFormatter" VARCHAR(255) NULL,
    "groupFormatter" VARCHAR(255) NULL,
    "colSpan" VARCHAR(255) NULL,
    frozen INTEGER NULL DEFAULT 0,
    resizable INTEGER NULL DEFAULT 1,
    sortable INTEGER NULL DEFAULT 1,
    "sortDescendingFirst" INTEGER NULL
);
-- end lazy-views schema

-- the following statements should be run once when updating from version
-- 1.1.1-alpha.1 to <version>.

-- begin changes of project-management version 2.0.0 (think "role" instead
-- of "user"; extract authentication)
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
-- end project-management 2.0.0 changes

-- begin changes of user-authentication version 3.0.0: users table
-- managed by plugin itself (previously in project-management)
CREATE TABLE users(
  _id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  password TEXT NOT NULL
);

-- converting any existing data to new schemata of PM 2.0.0 and user-auth 3.0.0.
-- On updating an existing instance. These should be no-ops when running this
-- script on a fresh container, they are only needed when updating a running
-- instance.
UPDATE projects SET owner_id=1;
UPDATE tables SET owner_id=1;
UPDATE views SET user_id=1;

INSERT INTO users (username, password)
  SELECT name as username, password
  FROM roles;

DELETE FROM roles;

-- There was an idea to have n:m or 1:n or whatever relationship between
-- users (with passwords) roles (with access to projects/tables/...)
-- We are still going to do this, however it will all be managed by a
-- dedicated user permission plugin. To avoid restricting it from the
-- get-go, we just create a single role that has access to everything,
-- and the perm plugin can take away privileges later.
INSERT INTO roles(_id, name, password)
  VALUES (1, 'all_users', '');
-- end dekanat-app<version> changes
