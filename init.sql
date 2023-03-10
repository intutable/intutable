-- user and permission schemata
CREATE TABLE users(
    _id SERIAL PRIMARY KEY,
    username text,
    password text,
    "globalRoleId" integer
);

CREATE TABLE roles(
    _id SERIAL PRIMARY KEY,
    "description" TEXT
);

CREATE TABLE permissions(
    "roleId" integer NOT NULL,
    action text COLLATE pg_catalog."default" NOT NULL,
    subject text COLLATE pg_catalog."default" NOT NULL,
    "subjectName" text COLLATE pg_catalog."default" NOT NULL,
    conditions text COLLATE pg_catalog."default",
    CONSTRAINT permissions_pkey PRIMARY KEY ("roleId", action, subject, "subjectName")
);

-- begin project-management schema
CREATE TABLE projects(
    _id SERIAL PRIMARY KEY,
    "project_name" TEXT,
    "owner_id" INTEGER,
    FOREIGN KEY("owner_id") REFERENCES users(_id)
);

CREATE TABLE tables(
    _id SERIAL PRIMARY KEY,
    key TEXT NOT NULL,
    name TEXT,
    "owner_id" INTEGER,
    FOREIGN KEY("owner_id") REFERENCES users(_id)
);

CREATE TABLE projects_tables(
    _id SERIAL PRIMARY KEY,
    "project_id" INTEGER,
    "table_id" INTEGER,
    FOREIGN KEY("project_id") REFERENCES projects(_id),
    FOREIGN KEY("table_id") REFERENCES tables(_id)
);

CREATE TABLE columns(
    _id SERIAL PRIMARY KEY,
    "column_name" TEXT,
    "table_id" INTEGER,
    type TEXT default 'string' NOT NULL,
    FOREIGN KEY("table_id") REFERENCES tables(_id)
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
    -- link columns always have an associated "backward" link that aggregates all linked rows.
    -- The backwards link, in turn, has a reference to the "forward" link.
    -- in non-link columns, this is null.
    "inverseLinkColumnId" INTEGER NULL,
    -- type of the content of a column (string, date, currency, ...)
    "cellType" TEXT NOT NULL,
    -- parameter to the type of a column (e.g. in List<Int>, List would be the cellType and Int
    -- the cellTypeParameter
    "cellTypeParameter" TEXT NULL,
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

-- converting any existing data to new schemata of PM 2.0.0 and user-auth 3.0.0.
-- On updating an existing instance. These should be no-ops when running this
-- script on a fresh container, they are only needed when updating a running
-- instance.
UPDATE projects SET owner_id=0;
UPDATE tables SET owner_id=0;
UPDATE views SET user_id=0;
-- end dekanat-app<version> changes

-- changes with lazy-views version 7.0.0 (introduce join pre-group option)
ALTER TABLE view_joins ADD COLUMN pre_group INTEGER NOT NULL DEFAULT 0;
UPDATE view_joins SET pre_group=0;
-- end LV 7.0.0 changes

-- TEST DATA!
-- Create users and default global roles
INSERT INTO users(_id, username, password, "globalRoleId")
    VALUES
    (0, 'admin@dekanat.de', '$argon2i$v=19$m=16,t=2,p=1$RlJjcHZQeDVHTVkzSUVjNw$yj4y+O1mXcwfCjuo/XGQ7w', 0),
    (1, 'write@dekanat.de', '$argon2i$v=19$m=16,t=2,p=1$RlJjcHZQeDVHTVkzSUVjNw$yj4y+O1mXcwfCjuo/XGQ7w', 1),
    (2, 'writesome@dekanat.de', '$argon2i$v=19$m=16,t=2,p=1$RlJjcHZQeDVHTVkzSUVjNw$yj4y+O1mXcwfCjuo/XGQ7w', 1),
    (3, 'readonly@dekanat.de', '$argon2i$v=19$m=16,t=2,p=1$RlJjcHZQeDVHTVkzSUVjNw$yj4y+O1mXcwfCjuo/XGQ7w', 1),
    (4, 'nothing@dekanat.de', '$argon2i$v=19$m=16,t=2,p=1$RlJjcHZQeDVHTVkzSUVjNw$yj4y+O1mXcwfCjuo/XGQ7w', 2);

INSERT INTO roles(_id, description)
    VALUES
    (0, 'Administrator'),
    (1, 'Normaler User'),
    (2, 'Gast User');

INSERT INTO permissions("roleId", "action", "subject", "subjectName", "conditions")
    VALUES
    (0, 'read', 'project', '', '');




-- begin user settings schema
CREATE TABLE user_settings(
    user_id integer unique,
    settings jsonb
);
-- end user settings schema

