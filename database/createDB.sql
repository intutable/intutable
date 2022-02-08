create table users(
    _id integer primary key autoincrement not null,
    email text,
    password text
);

create table projects(
    _id integer primary key autoincrement not null,
    projectName text,
    ownerId integer,
    foreign key(ownerId) references users(_id)
);

create table userprojects(
    _id integer primary key autoincrement not null,
    userId integer,
    projectId integer,
    foreign key(userId) references users(_id),
    foreign key(projectId) references projects(_id)
);

create table tables(
    _id integer primary key autoincrement not null,
    key text not null,
    name text,
    ownerId integer,
    foreign key(ownerId) references users(_id)
);

create table projecttables(
    _id integer primary key autoincrement not null,
    projectId integer,
    tableId integer,
    foreign key(projectId) references projects(_id),
    foreign key(tableId) references tables(_id)
);

create table columns(
    _id integer primary key AUTOINCREMENT not null,
    columnName text,
    editable integer default 1 not null,
    hidden integer default 0 not null,
    type text default "string" not null,
    displayName text null
);

create table tablecolumns(
    _id integer primary key autoincrement not null,
    tableId integer,
    columnId integer,
    foreign key(tableId) references tables(_id),
    foreign key(columnId) references columns(_id)
);

insert into users(email, password) values("admin@dekanat.de", "$argon2i$v=19$m=4096,t=3,p=1$vzOdnV+KUtQG3va/nlOOxg$vzo1JP16rQKYmXzQgYT9VjUXUXPA6cWHHAvXutrRHtM");
insert into projects(projectName, ownerId) values("Personal", 1);
insert into userprojects(userId, projectId) values(1, 1);

create table if not exists p1_personen(
    _id integer primary key not null,
    vorname text,
    nachname text,
    email text
);

insert into p1_personen(vorname, nachname, email) 
values("Raphael", "Kirchholtes", "dk457@stud.uni-heidelberg");
insert into p1_personen(_id, vorname, nachname, email) 
values(1337, "Kilian", "Folger", "ub437@stud.uni-heidelberg");
insert into p1_personen(vorname, nachname, email) 
values("Nikita-Nick", "Funk", "kf235@stud.uni-heidelberg");

create table if not exists p1_kommissionen(
    _id integer primary key not null,
    bezeichnung text,
    gruendung text,
    aufloesung text
);

insert into p1_kommissionen(bezeichnung, gruendung, aufloesung)
values ("IT-Gruppe Dekanat", "15. September 2021", null);

create table if not exists p1_einrichtungen(
    _id integer primary key not null,
    name text,
    adresse text
);

insert into p1_einrichtungen(name, adresse)
values ("Dekanat MathInf", "Mathematikon Neuenheim");

insert into tables(key, name, ownerId) values("p1_personen", "personen", 1);
insert into tables(key, name, ownerId) values("p1_kommissionen", "kommissionen", 1);
insert into tables(key, name, ownerId) values("p1_einrichtungen", "einrichtungen", 1);
insert into projecttables(projectId, tableId) values(1, 1);
insert into projecttables(projectId, tableId) values(1, 2);
insert into projecttables(projectId, tableId) values(1, 3);

insert into columns(columnName, displayName) values("_id", "UID");
insert into columns(columnName, displayName) values("vorname", "Vorname");
insert into columns(columnName, displayName) values("nachname", "Nachname");
insert into columns(columnName, displayName) values("email", "E-Mail");

insert into columns(columnName, displayName) values("_id", "ID");
insert into columns(columnName, displayName) values("bezeichnung", "Bezeichnung");
insert into columns(columnName, displayName) values("gruendung", "Gründung");
insert into columns(columnName, displayName) values("aufloesung", "Auflösung");

insert into columns(columnName, displayName) values("_id", "ID");
insert into columns(columnName, displayName) values("name", "Name");
insert into columns(columnName, displayName) values("adresse", "Vorname");

insert into tablecolumns(tableId, columnId) values(1, 1);
insert into tablecolumns(tableId, columnId) values(1, 2);
insert into tablecolumns(tableId, columnId) values(1, 3);
insert into tablecolumns(tableId, columnId) values(1, 4);

insert into tablecolumns(tableId, columnId) values(2, 5);
insert into tablecolumns(tableId, columnId) values(2, 6);
insert into tablecolumns(tableId, columnId) values(2, 7);
insert into tablecolumns(tableId, columnId) values(2, 8);

insert into tablecolumns(tableId, columnId) values(3, 9);
insert into tablecolumns(tableId, columnId) values(3, 10);
insert into tablecolumns(tableId, columnId) values(3, 11);

