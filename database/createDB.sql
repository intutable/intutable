create table if not exists users(
    _id integer primary key autoincrement not null,
    email text,
    password text
);


create table if not exists userprojects(
    _id integer primary key autoincrement not null,
    userId integer,
    projectId integer,
    foreign key(userId) references user(_id),
    foreign key(projectId) references projects(_id)
);

create table if not exists projects(
    _id integer primary key autoincrement not null,
    projectName text,
    owner text
);


create table if not exists projecttables(
    _id integer primary key autoincrement not null,
    projectId integer,
    tableId integer,
    foreign key(projectId) references projects(_id),
    foreign key(tableId) references tables(_id)
);

create table if not exists tables(
    _id integer primary key autoincrement not null,
    key text,
    name text,
    owner text
);

create table if not exists tablecolumns(
    _id integer primary key autoincrement not null,
    tableId integer,
    columnId integer,
    foreign key(tableId) references tables(_id),
    foreign key(columnId) references columns(_id)
);

create table if not exists columns(
    _id integer primary key AUTOINCREMENT not null,
    columnName text,
    editable integer default 1 not null,
    hidden integer default 0 not null
);

insert into users(email, password) values("admin@dekanat.de", "$argon2i$v=19$m=4096,t=3,p=1$vzOdnV+KUtQG3va/nlOOxg$vzo1JP16rQKYmXzQgYT9VjUXUXPA6cWHHAvXutrRHtM");
insert into projects(projectName, owner) values("Personal", "admin@dekanat.de");
insert into userprojects(userId, projectId) values(1, 1);

create table if not exists p1_personen(
    _id integer primary key not null,
    vorname text,
    nachname text,
    email text
);

insert into p1_personen(vorname, nachname, email) 
values("Raphael", "Kirchholtes", "dk457@stud.uni-heidelberg");

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

insert into tables(key, name, owner) values("p1_personen", "personen", "admin@dekanat.de");
insert into tables(key, name, owner) values("p1_kommissionen", "kommissionen", "admin@dekanat.de");
insert into tables(key, name, owner) values("p1_einrichtungen", "einrichtungen", "admin@dekanat.de");
insert into projecttables(projectId, tableId) values(1, 1);
insert into projecttables(projectId, tableId) values(1, 2);
insert into projecttables(projectId, tableId) values(1, 3);

insert into columns(columnName) values("vorname");
insert into columns(columnName) values("nachname");
insert into columns(columnName) values("email");

insert into columns(columnName) values("bezeichnung");
insert into columns(columnName) values("gruendung");
insert into columns(columnName) values("aufloesung");

insert into columns(columnName) values("name");
insert into columns(columnName) values("adresse");

insert into tablecolumns(tableId, columnId) values(1, 1);
insert into tablecolumns(tableId, columnId) values(1, 2);
insert into tablecolumns(tableId, columnId) values(1, 3);
insert into tablecolumns(tableId, columnId) values(2, 4);
insert into tablecolumns(tableId, columnId) values(2, 5);
insert into tablecolumns(tableId, columnId) values(2, 6);
insert into tablecolumns(tableId, columnId) values(3, 7);
insert into tablecolumns(tableId, columnId) values(3, 8);

