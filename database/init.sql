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
    "displayName" TEXT NULL,
    FOREIGN KEY("tableId") REFERENCES tables(_id)
);

CREATE TABLE tablecolumns(
    _id SERIAL PRIMARY KEY,
    "tableId" INTEGER,
    "columnId" INTEGER,
    FOREIGN KEY("tableId") REFERENCES tables(_id),
    FOREIGN KEY("columnId") REFERENCES columns(_id)
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

insert into p1_personen(vorname, nachname, email) 
values('Raphael', 'Kirchholtes', 'dk457@stud.uni-heidelberg');
insert into p1_personen(_id, vorname, nachname, email) 
values(1337, 'Kilian', 'Folger', 'ub437@stud.uni-heidelberg');
insert into p1_personen(vorname, nachname, email) 
values('Nikita-Nick', 'Funk', 'kf235@stud.uni-heidelberg');

create table if not exists p1_kommissionen(
    _id serial primary key,
    bezeichnung text,
    gruendung text,
    aufloesung text
);

insert into p1_kommissionen(bezeichnung, gruendung, aufloesung)
values ('IT-Gruppe Dekanat', '15. September 2021', null);

create table if not exists p1_einrichtungen(
    _id serial primary key,
    name text,
    adresse text
);

insert into p1_einrichtungen(name, adresse)
values ('Dekanat MathInf', 'Mathematikon Neuenheim');

insert into tables(key, name, "ownerId") values('p1_personen', 'personen', 1);
insert into tables(key, name, "ownerId") values('p1_kommissionen', 'kommissionen', 1);
insert into tables(key, name, "ownerId") values('p1_einrichtungen', 'einrichtungen', 1);
insert into projecttables("projectId", "tableId") values(1, 1);
insert into projecttables("projectId", "tableId") values(1, 2);
insert into projecttables("projectId", "tableId") values(1, 3);

insert into columns("columnName", "tableId", "displayName") values('_id', 1, 'ID');
insert into columns("columnName", "tableId", "displayName") values('vorname', 1, 'Vorname');
insert into columns("columnName", "tableId", "displayName") values('nachname', 1, 'Nachname');
insert into columns("columnName", "tableId", "displayName") values('email', 1, 'E-Mail');

insert into columns("columnName", "tableId", "displayName") values('_id', 2, 'ID');
insert into columns("columnName", "tableId", "displayName") values('bezeichnung', 2, 'Bezeichnung');
insert into columns("columnName", "tableId", "displayName") values('gruendung', 2, 'Gründung');
insert into columns("columnName", "tableId", "displayName") values('aufloesung', 2, 'Auflösung');

insert into columns("columnName", "tableId", "displayName") values('_id', 3, 'ID');
insert into columns("columnName", "tableId", "displayName") values('name', 3, 'Name');
insert into columns("columnName", "tableId", "displayName") values('adresse', 3, 'Vorname');
