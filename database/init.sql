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
CREATE TABLE jts(
    _id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    table_id INTEGER NOT NULL,
    user_id INTEGER NULL,
    row_options TEXT NOT NULL
);

CREATE TABLE jt_joins(
    _id SERIAL PRIMARY KEY,
    jt_id INTEGER NOT NULL,
    foreign_jt_id INTEGER NOT NULL,
    "on" TEXT NOT NULL
);

CREATE TABLE jt_columns(
    _id SERIAL PRIMARY KEY,
    jt_id INTEGER NOT NULL,
    join_id INTEGER NULL,
    column_id INTEGER NOT NULL,
    -- custom metadata
    "displayName" TEXT NULL,
    "userPrimary" INTEGER DEFAULT 0 NOT NULL,
    editable INTEGER DEFAULT 1 NOT NULL,
    editor TEXT NULL
);

insert into users(email, password) values('admin@dekanat.de', '$argon2i$v=19$m=4096,t=3,p=1$vzOdnV+KUtQG3va/nlOOxg$vzo1JP16rQKYmXzQgYT9VjUXUXPA6cWHHAvXutrRHtM');
insert into projects("projectName", "ownerId") values('Personal', 1);
insert into userprojects("userId", "projectId") values(1, 1);


create table if not exists p1_personen(
    _id serial primary key,
    vorname text,
    nachname text,
    email text
);
insert into tables(_id, key, name, "ownerId") values(1, 'p1_personen', 'personen', 1);
insert into projecttables("projectId", "tableId") values(1, 1);
insert into columns(_id, "columnName", "tableId") values(1, '_id', 1);
insert into columns(_id, "columnName", "tableId") values(2, 'vorname', 1);
insert into columns(_id, "columnName", "tableId") values(3, 'nachname', 1);
insert into columns(_id, "columnName", "tableId") values(4, 'email', 1);

INSERT INTO jts(_id, name, table_id, user_id, row_options)
  VALUES(1, 'Personen', 1, NULL,
         '{"conditions": [], "groupColumns": [], "sortColumns": []}');
INSERT INTO jt_columns(_id, jt_id, join_id, column_id, "displayName", editor)
  VALUES(1, 1, NULL, 1, 'ID', 'number');
INSERT INTO jt_columns(_id, jt_id, join_id, column_id, "displayName", editor)
  VALUES(2, 1, NULL, 2, 'Vorname', 'string');
INSERT INTO jt_columns(_id, jt_id, join_id, column_id,
                       "displayName", "userPrimary", editor)
  VALUES(3, 1, NULL, 3, 'Nachname', 1, 'string');
INSERT INTO jt_columns(_id, jt_id, join_id, column_id, "displayName", editor)
  VALUES(4, 1, NULL, 4, 'E-Mail', 'string');


create table if not exists p1_kommissionen(
    _id serial primary key,
    bezeichnung text,
    gruendung text,
    aufloesung text
);
insert into tables(_id, key, name, "ownerId")
  values(2, 'p1_kommissionen', 'kommissionen', 1);
insert into projecttables("projectId", "tableId") values(1, 2);
insert into columns(_id, "columnName", "tableId") values(5, '_id', 2);
insert into columns(_id, "columnName", "tableId") values(6, 'bezeichnung', 2);
insert into columns(_id, "columnName", "tableId") values(7, 'gruendung', 2);
insert into columns(_id, "columnName", "tableId") values(8, 'aufloesung', 2);

INSERT INTO jts(_id, name, table_id, user_id, row_options)
  VALUES(2, 'Kommissionen', 2, NULL,
         '{"conditions": [], "groupColumns": [], "sortColumns": []}');
INSERT INTO jt_columns(_id, jt_id, join_id, column_id, "displayName", editor)
  VALUES(5, 2, NULL, 5, 'ID', 'number');
INSERT INTO jt_columns(_id, jt_id, join_id, column_id,
                       "displayName", "userPrimary", editor)
  VALUES(6, 2, NULL, 6, 'Bezeichnung', 1, 'string');
INSERT INTO jt_columns(_id, jt_id, join_id, column_id, "displayName", editor)
  VALUES(7, 2, NULL, 7, 'Gründung', 'string');
INSERT INTO jt_columns(_id, jt_id, join_id, column_id, "displayName", editor)
  VALUES(8, 2, NULL, 8, 'Auflösung', 'string');


create table if not exists p1_einrichtungen(
    _id serial primary key,
    name text,
    adresse text
);
insert into tables(_id, key, name, "ownerId")
  values(3, 'p1_einrichtungen', 'einrichtungen', 1);
insert into projecttables("projectId", "tableId") values(1, 3);
insert into columns(_id, "columnName", "tableId") values(9, '_id', 3);
insert into columns(_id, "columnName", "tableId") values(10, 'name', 3);
insert into columns(_id, "columnName", "tableId") values(11, 'adresse', 3);

INSERT INTO jts(_id, name, table_id, user_id, row_options)
  VALUES(3, 'Einrichtungen', 3, NULL,
         '{"conditions": [], "groupColumns": [], "sortColumns": []}');
INSERT INTO jt_columns(_id, jt_id, join_id, column_id, "displayName", editor)
  VALUES(9, 3, NULL, 9, 'ID', 'number');
INSERT INTO jt_columns(_id, jt_id, join_id, column_id,
                       "displayName", "userPrimary", editor)
  VALUES(10, 3, NULL, 10, 'Name', 1, 'string');
INSERT INTO jt_columns(_id, jt_id, join_id, column_id, "displayName", editor)
VALUES(11, 3, NULL, 11, 'Adresse', 'string');


-- object data
insert into p1_personen(vorname, nachname, email) 
values('Raphael', 'Kirchholtes', 'dk457@stud.uni-heidelberg.de');
insert into p1_personen(vorname, nachname, email) 
values('Kilian', 'Folger', 'ub437@stud.uni-heidelberg.de');
insert into p1_personen(vorname, nachname, email) 
values('Nikita-Nick', 'Funk', 'kf235@stud.uni-heidelberg.de');
INSERT INTO p1_personen(vorname, nachname, email)
  VALUES('Luis', 'Schulte', 'luis.schulte@stud.uni-heidelberg.de');

insert into p1_kommissionen(bezeichnung, gruendung, aufloesung)
values ('IT-Gruppe Dekanat', '15. September 2021', null);

insert into p1_einrichtungen(name, adresse)
values ('Dekanat MathInf', 'Mathematikon Neuenheim');

-- stupid pkey sequences evidently don't count up when we do manual IDs
SELECT setval('users__id_seq', (SELECT MAX(_id) FROM users)+1);
SELECT setval('projects__id_seq', (SELECT MAX(_id) FROM projects)+1);
SELECT setval('userprojects__id_seq', (SELECT MAX(_id) FROM userprojects)+1);
SELECT setval('tables__id_seq', (SELECT MAX(_id) FROM tables)+1);
SELECT setval('projecttables__id_seq', (SELECT MAX(_id) FROM projecttables)+1);
SELECT setval('columns__id_seq', (SELECT MAX(_id) FROM columns)+1);
SELECT setval('jts__id_seq', (SELECT MAX(_id) FROM jts)+1);
SELECT setval('jt_joins__id_seq', (SELECT MAX(_id) FROM jt_joins)+1);
SELECT setval('jt_columns__id_seq', (SELECT MAX(_id) FROM jt_columns)+1);
