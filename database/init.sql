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

-- join-tables meta tables
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
    -- custom metadata, see types/rdg.ts for explanations on them
    -- userPrimary: a designated column that is shown to the user as a sort of primary key,
    -- for example to create short previews of records.
    function TEXT NULL,
    -- custom metadata
    "displayName" TEXT NULL,
    "userPrimary" INTEGER DEFAULT 0 NOT NULL,
    -- kinds of columns: plain data (text, date, ...), link to other table, lookup field, ...
    _kind TEXT NULL,
    "displayName" TEXT NULL,
    -- various RDG props
    editable INTEGER DEFAULT 1,
    editor TEXT,
    formatter TEXT,
    width VARCHAR(32) NULL,
    "minWidth" VARCHAR(32) NULL,
    "maxWidth" VARCHAR(32) NULL,
    "cellClass" VARCHAR(255) NULL,
    "headerCellClass" VARCHAR(255) NULL,
    "summaryCellClass" VARCHAR(255) NULL,
    "summaryFormatter" VARCHAR(255) NULL,
    "groupFormatter" VARCHAR(255) NULL,
    "colSpan" VARCHAR(255) NULL,
    frozen INTEGER NULL,
    resizable INTEGER NULL,
    sortable INTEGER NULL,
    "sortDescendingFirst" INTEGER NULL,
    "renderFormatter" INTEGER DEFAULT 0,
    "editOnClick" INTEGER DEFAULT 0,
    "commitOnOutsideClick" INTEGER DEFAULT 0,
    "onCellKeyDown" VARCHAR(255) NULL,
    "onNavigation" VARCHAR(255) NULL,
    "headerRenderer" VARCHAR(255) NULL
);

insert into users(email, password) values('admin@dekanat.de', '$argon2i$v=19$m=4096,t=3,p=1$vzOdnV+KUtQG3va/nlOOxg$vzo1JP16rQKYmXzQgYT9VjUXUXPA6cWHHAvXutrRHtM');
insert into projects("projectName", "ownerId") values('Fakultät MathInf', 1);
insert into userprojects("userId", "projectId") values(1, 1);


create table if not exists p1_personen(
    _id serial primary key,
    nachname text,
    vorname text,
    m_w text,
    titel text,
    stellung text
);
insert into tables(_id, key, name, "ownerId") values(1, 'p1_personen', 'personen', 1);
insert into projecttables("projectId", "tableId") values(1, 1);
insert into columns(_id, "columnName", "tableId") values(1, '_id', 1);
insert into columns(_id, "columnName", "tableId") values(2, 'nachname', 1);
insert into columns(_id, "columnName", "tableId") values(3, 'vorname', 1);
insert into columns(_id, "columnName", "tableId") values(5, 'titel', 1);
insert into columns(_id, "columnName", "tableId") values(6, 'stellung', 1);

INSERT INTO views(_id, name, base_id, base_type, user_id, row_options)
  VALUES(1, 'Personen', 1, 0, NULL,
         '{"conditions": [], "groupColumns": [], "sortColumns": [{ "column":1, "order": "asc"}]}');
INSERT INTO view_columns(_id, view_id, join_id, column_id,
                       _kind, "displayName", editor, formatter)
  VALUES(1, 1, NULL, 1, 'standard', 'ID', 'number', 'number');
INSERT INTO view_columns(_id, view_id, join_id, column_id,
                       _kind, "displayName", "userPrimary", editor, formatter)
  VALUES(2, 1, NULL, 2, 'standard', 'Nachname', 1, 'string', 'string');
INSERT INTO view_columns(_id, view_id, join_id, column_id,
                       _kind, "displayName", editor, formatter)
  VALUES(3, 1, NULL, 3, 'standard', 'Vorname', 'string', 'string');
INSERT INTO view_columns(_id, view_id, join_id, column_id,
                       _kind, "displayName", editor, formatter)
  VALUES(5, 1, NULL, 5, 'standard', 'Titel', 'string', 'string');
INSERT INTO view_columns(_id, view_id, join_id, column_id,
                       _kind, "displayName", editor, formatter)
  VALUES(6, 1, NULL, 6, 'standard', 'Stellung', 'string', 'string');


create table if not exists p1_organe(
    _id serial primary key,
    name text,
    kuerzel text,
    typ text,
    fk_math_inf text
);
insert into tables(_id, key, name, "ownerId")
  values(2, 'p1_organe', 'organe', 1);
insert into projecttables("projectId", "tableId") values(1, 2);
insert into columns(_id, "columnName", "tableId") values(7, '_id', 2);
insert into columns(_id, "columnName", "tableId") values(8, 'name', 2);
insert into columns(_id, "columnName", "tableId") values(9, 'kuerzel', 2);
insert into columns(_id, "columnName", "tableId") values(10, 'typ', 2);
insert into columns(_id, "columnName", "tableId") values(11, 'fk_math_inf', 2);

INSERT INTO views(_id, name, base_id, base_type, user_id, row_options)
  VALUES(2, 'Organe', 2, 0, NULL,
         '{"conditions": [], "groupColumns": [], "sortColumns": [{ "column":7, "order": "asc"}]}');
INSERT INTO view_columns(_id, view_id, join_id, column_id,
                       _kind, "displayName", editor, formatter)
  VALUES(7, 2, NULL, 7, 'standard', 'ID', 'number', 'number');
INSERT INTO view_columns(_id, view_id, join_id, column_id,
                       _kind, "displayName", "userPrimary", editor, formatter)
  VALUES(8, 2, NULL, 8, 'standard', 'Name', 1, 'string', 'string');
INSERT INTO view_columns(_id, view_id, join_id, column_id,
                       _kind, "displayName", editor, formatter)
  VALUES(9, 2, NULL, 9, 'standard', 'Kürzel', 'string', 'string');
INSERT INTO view_columns(_id, view_id, join_id, column_id,
                       _kind, "displayName", editor, formatter)
  VALUES(10, 2, NULL, 10, 'standard', 'Typ', 'string', 'string');
INSERT INTO view_columns(_id, view_id, join_id, column_id,
                       _kind, "displayName", editor, formatter)
  VALUES(11, 2, NULL, 11, 'standard', 'FK/Math/Inf', 'string', 'string');

CREATE TABLE p1_rollen (
    _id INTEGER NOT NULL,
    name CHARACTER VARYING(255),
    "j#1_fk" INTEGER,
    "j#2_fk" INTEGER,
    rolle CHARACTER VARYING(255)
);
INSERT INTO tables(_id, key, name, "ownerId")
  VALUES(4, 'p1_rollen', 'rollen', 1);
INSERT INTO projecttables("projectId", "tableId") VALUES(1, 4);
INSERT INTO columns(_id, "columnName", "tableId", type)
  VALUES(13, '_id', 4, 'increments');
INSERT INTO columns(_id, "columnName", "tableId", type)
  VALUES(14, 'name', 4, 'string');
INSERT INTO columns(_id, "columnName", "tableId", type)
  VALUES(15, 'j#1_fk', 4, 'integer');
INSERT INTO columns(_id, "columnName", "tableId", type)
  VALUES(16, 'j#2_fk', 4, 'integer');
INSERT INTO columns(_id, "columnName", "tableId", type)
  VALUES(17, 'rolle', 4, 'string');

INSERT INTO views(_id, name, base_id, base_type, user_id, row_options)
  VALUES(4, 'Rollen', 4, 0, 1, '{"conditions":[],"groupColumns":[],"sortColumns":[{"column":13,"order":"asc"}]}');
INSERT INTO view_joins(_id, view_id, base_id, base_type, "on")
  VALUES(1, 4, 1, 1, '[15,"=",1]');
INSERT INTO view_joins(_id, view_id, base_id, base_type, "on")
  VALUES(2, 4, 2, 1, '[16,"=",7]');

INSERT INTO view_columns(_id, view_id, join_id, column_id,
                       _kind, "displayName", "userPrimary",
                       editable, editor, formatter)
  VALUES(13, 4, NULL, 13, 'standard', 'ID', 0, 1, 'number', NULL);
INSERT INTO view_columns(_id, view_id, join_id, column_id,
                       _kind, "displayName", "userPrimary",
                       editable, editor, formatter)
  VALUES(14, 4, NULL, 14, 'standard', 'Name', 1, 1, 'string', NULL);
INSERT INTO view_columns(_id, view_id, join_id, column_id,
                       _kind, "displayName", "userPrimary",
                       editable, editor, formatter)
  VALUES(15, 4, 1, 2, 'link', 'Nachname', 0, 0, NULL, 'linkColumn');
INSERT INTO view_columns(_id, view_id, join_id, column_id,
                       _kind, "displayName", "userPrimary",
                       editable, editor, formatter)
  VALUES(17, 4, NULL, 17, 'standard', 'Rolle', 0, 1, 'string', 'string');
INSERT INTO view_columns(_id, view_id, join_id, column_id,
                       _kind, "displayName", "userPrimary",
                       editable, editor, formatter)
  VALUES(16, 4, 2, 8, 'link', 'Organ', 0, 0, NULL, 'linkColumn');


-- object data
INSERT INTO p1_personen(nachname, vorname, titel, stellung)
  VALUES('Gertz', 'Michael', 'Prof.Dr.', 'Professor');
INSERT INTO p1_personen(nachname, vorname, titel, stellung)
  VALUES('Paech', 'Barbara', 'Prof.Dr.', 'Professor');
INSERT INTO p1_personen(nachname, vorname, titel, stellung)
  VALUES('Fröning', 'Holger', 'Prof.Dr.', 'Professor');
INSERT INTO p1_personen(nachname, vorname, titel, stellung)
  VALUES('Schmidt', 'Jan-Philip', 'Dr.', 'FK-Leitung');
INSERT INTO p1_personen(nachname, vorname, titel, stellung)
  VALUES('Strzodka', 'Robert', 'Prof.Dr.', 'Professor');
INSERT INTO p1_personen(nachname, vorname, titel, stellung)
  VALUES('Walcher', 'Johannes', 'Prof.Dr.', 'Professor');
INSERT INTO p1_personen(nachname, vorname, titel, stellung)
  VALUES('Knüpfer', 'Hannes', 'Prof.Dr.', 'Professor');
INSERT INTO p1_personen(nachname, vorname, titel, stellung)
  VALUES('Albers', 'Peter', 'Prof.Dr.', 'Professor');
INSERT INTO p1_personen(nachname, vorname, titel, stellung)
  VALUES('Johannes', 'Jan', 'Prof.Dr.', 'Professor');
INSERT INTO p1_personen(nachname, vorname, titel, stellung)
  VALUES('Andrzejak', 'Artur', 'Prof.Dr.', 'Professor');

INSERT INTO p1_organe(name, kuerzel, typ, fk_math_inf)
  VALUES ('Dekanat', 'Dekanat', 'Einrichtung', 'FK');
INSERT INTO p1_organe(name, kuerzel, typ, fk_math_inf)
  VALUES ('Fakultätsvorstand', 'FK-Vorstand', 'Kommission', 'FK');
INSERT INTO p1_organe(name, kuerzel, typ, fk_math_inf)
  VALUES ('Institut für Angewandte Mathematik', 'IAM', 'Einrichtung', 'Math');
INSERT INTO p1_organe(name, kuerzel, typ, fk_math_inf)
  VALUES ('Institut für Informatik', 'IfI', 'Einrichtung', 'Inf');
INSERT INTO p1_organe(name, kuerzel, typ, fk_math_inf)
  VALUES ('Institut für Technische Informatik', 'ZITI', 'Einrichtung', 'Inf');
INSERT INTO p1_organe(name, kuerzel, typ, fk_math_inf)
  VALUES ('Mathematisches Institut', 'MI', 'Einrichtung', 'Math');
INSERT INTO p1_organe(name, kuerzel, typ, fk_math_inf)
  VALUES ('PA BA und MA Informatik', 'PA BA+MA Inf', 'Kommission', 'Inf');
INSERT INTO p1_organe(name, kuerzel, typ, fk_math_inf)
  VALUES ('PA Informatik Promotionen', 'PA Prom Inf', 'Kommission', 'Inf');
INSERT INTO p1_organe(name, kuerzel, typ, fk_math_inf)
  VALUES ('PA Lehramt Informatik', 'PA LA Inf', 'Kommission', 'Inf');
INSERT INTO p1_organe(name, kuerzel, typ, fk_math_inf)
  VALUES ('PA Math Promotionen', 'PA Prom Math', 'Kommission', 'Math');
INSERT INTO p1_organe(name, kuerzel, typ, fk_math_inf)
  VALUES ('StuKo Informatik', 'SK Inf', 'Kommission', 'Inf');
INSERT INTO p1_organe(name, kuerzel, typ, fk_math_inf)
  VALUES ('StuKo Mathematik', 'SK Math', 'Kommission', 'Math');

INSERT INTO p1_rollen(_id, name, "j#1_fk", "j#2_fk", rolle)
  VALUES(1, NULL, 10, 2, 'Prodekan');
INSERT INTO p1_rollen(_id, name, "j#1_fk", "j#2_fk", rolle)
  VALUES(3, NULL, 6, 2, 'Dekan');
INSERT INTO p1_rollen(_id, name, "j#1_fk", "j#2_fk", rolle)
  VALUES(4, NULL, 3, 11, 'Vorsitz');
INSERT INTO p1_rollen(_id, name, "j#1_fk", "j#2_fk", rolle)
  VALUES(5, NULL, 10, 11, 'Mitglied');
INSERT INTO p1_rollen(_id, name, "j#1_fk", "j#2_fk", rolle)
  VALUES(6, NULL, 7, 12, 'Vorsitz');
INSERT INTO p1_rollen(_id, name, "j#1_fk", "j#2_fk", rolle)
  VALUES(7, NULL, 2, 9, 'Vorsitz');
INSERT INTO p1_rollen(_id, name, "j#1_fk", "j#2_fk", rolle)
  VALUES(8, NULL, 4, 1, 'Vorsitz');
INSERT INTO p1_rollen(_id, name, "j#1_fk", "j#2_fk", rolle)
  VALUES(2, NULL, 10, 8, 'Vorsitz');
INSERT INTO p1_rollen(_id, name, "j#1_fk", "j#2_fk", rolle)
  VALUES(9, NULL, 6, 10, 'Vorsitz');

-- stupid pkey sequences evidently don't count up when we do manual IDs
SELECT setval('users__id_seq', (SELECT MAX(_id) FROM users)+1);
SELECT setval('projects__id_seq', (SELECT MAX(_id) FROM projects)+1);
SELECT setval('userprojects__id_seq', (SELECT MAX(_id) FROM userprojects)+1);
SELECT setval('tables__id_seq', (SELECT MAX(_id) FROM tables)+1);
SELECT setval('projecttables__id_seq', (SELECT MAX(_id) FROM projecttables)+1);
SELECT setval('columns__id_seq', (SELECT MAX(_id) FROM columns)+1);
SELECT setval('views__id_seq', (SELECT MAX(_id) FROM views)+1);
SELECT setval('view_joins__id_seq', (SELECT MAX(_id) FROM view_joins)+1);
SELECT setval('view_columns__id_seq', (SELECT MAX(_id) FROM view_columns)+1);