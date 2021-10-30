
create table if not exists commissions (
    _id integer primary key autoincrement not null,
    name text not null,
    description text not null,
    createdAt date not null,
    dissolvedAt date
);

create table if not exists commissionFunctions (
    _id integer primary key autoincrement not null,
    content text not null
);

create table if not exists employmentFunctions (
    _id integer primary key autoincrement not null,
    content text not null
);

create table if not exists employmentStatus (
    _id integer primary key autoincrement not null,
    content text not null
);

create table if not exists facilityTypes (
    _id integer primary key autoincrement not null,
    content text not null
);

create table if not exists employees (
    _id integer primary key autoincrement not null,
    zipCode text not null,
    location text not null,
    street text not null,
    fax text not null,
    link text not null
);

create table if not exists facilities (
    _id integer primary key autoincrement not null,
    parentId int references facilities(_id),
    typeId int references facilityTypes(_id) not null,
    notes text not null,
    name text not null,
    zipCode text not null,
    location text not null,
    street text not null,
    fax text not null, 
    link text not null,
    phone text not null,
    mail text not null
);

create table if not exists members (
    _id integer primary key autoincrement not null,
    employeeId int references employees(_id),
    firstName text not null,
    lastName text not null,
    description text not null,
    title text not null,
    phone text not null,
    mail text not null
);

create table if not exists employments (
    _id integer primary key autoincrement not null,
    facilityId int references facilities(_id) not null,
    memberId int references members(_id) not null,
    functionId int references employmentFunctions(_id) not null,
    statusId int references employmentStatus(_id) not null,
    startedAt date not null,
    endedAt date
);

create table if not exists participations (
    _id integer primary key autoincrement not null,
    commissionId int references commissions(_id) not null,
    memberId int references members(_id) not null,
    functionId int references commissionFunctions(_id) not null,
    joinedAt date not null,
    leftAt date,
    representiveMemberId int references members(_id)
);

create table if not exists tables (
    _id integer primary key not null,
    name text not null,
    unique(name)
);

create table if not exists columns (
    _id integer primary key not null,
    tableId integer not null,
    name text not null,
    foreign key(tableId) references tables(_id),
    unique(name, tableId)
);

create table if not exists metaBoolOptions (
    entityId integer not null ,
    entityType integer not null,
    property text not null,
    value boolean not null,
    primary key(entityId, entityType)
);

insert into tables(name) values("commissions");

insert into columns(name, tableId) values("_id", (select _id from tables where name="commissions"));
insert into columns(name, tableId) values("name", (select _id from tables where name="commissions"));
insert into columns(name, tableId) values("description", (select _id from tables where name="commissions"));
insert into columns(name, tableId) values("createdAt", (select _id from tables where name="commissions"));
insert into columns(name, tableId) values("dissolvedAt", (select _id from tables where name="commissions"));


insert into tables(name) values("commissionFunctions");

insert into columns(name, tableId) values("_id", (select _id from tables where name="commissionFunctions"));
insert into columns(name, tableId) values("content", (select _id from tables where name="commissionFunctions"));


insert into tables(name) values("employmentFunctions");
insert into columns(name, tableId) values("_id", (select _id from tables where name="employmentFunctions"));
insert into columns(name, tableId) values("content", (select _id from tables where name="employmentFunctions"));

insert into tables(name) values ("employmentStatus");
insert into columns(name, tableId) values("_id", (select _id from tables where name="employmentStatus"));
insert into columns(name, tableId) values("content", (select _id from tables where name="employmentStatus"));

insert into tables(name) values ("facilityTypes");
insert into columns(name, tableId) values("_id", (select _id from tables where name="facilityTypes"));
insert into columns(name, tableId) values("content", (select _id from tables where name="facilityTypes"));

insert into tables(name) values ("employees");
insert into columns (name, tableId) values("_id", (select _id from tables where name="employees"));
insert into columns (name, tableId) values("zipCode", (select _id from tables where name="employees"));
insert into columns (name, tableId) values("location", (select _id from tables where name="employees"));
insert into columns (name, tableId) values("street", (select _id from tables where name="employees"));
insert into columns (name, tableId) values("fax", (select _id from tables where name="employees"));
insert into columns (name, tableId) values("link", (select _id from tables where name="employees"));

insert into tables(name) values ("facilities");
insert into columns(name, tableId) values ("_id", (select _id from tables where name="facilities"));
insert into columns(name, tableId) values ("parentId", (select _id from tables where name="facilities"));
insert into columns(name, tableId) values ("typeId", (select _id from tables where name="facilities"));
insert into columns(name, tableId) values ("notes", (select _id from tables where name="facilities"));
insert into columns(name, tableId) values ("name", (select _id from tables where name="facilities"));
insert into columns(name, tableId) values ("zipCode", (select _id from tables where name="facilities"));
insert into columns(name, tableId) values ("location", (select _id from tables where name="facilities"));
insert into columns(name, tableId) values ("street", (select _id from tables where name="facilities"));
insert into columns(name, tableId) values ("fax", (select _id from tables where name="facilities"));
insert into columns(name, tableId) values ("link", (select _id from tables where name="facilities"));
insert into columns(name, tableId) values ("phone", (select _id from tables where name="facilities"));
insert into columns(name, tableId) values ("mail", (select _id from tables where name="facilities"));

insert into tables(name) values ("members");
insert into columns(name, tableId) values ("_id", (select _id from tables where name="members"));
insert into columns(name, tableId) values ("employeeId", (select _id from tables where name="members"));
insert into columns(name, tableId) values ("firstName", (select _id from tables where name="members"));
insert into columns(name, tableId) values ("lastName", (select _id from tables where name="members"));
insert into columns(name, tableId) values ("description", (select _id from tables where name="members"));
insert into columns(name, tableId) values ("title", (select _id from tables where name="members"));
insert into columns(name, tableId) values ("phone", (select _id from tables where name="members"));
insert into columns(name, tableId) values ("mail", (select _id from tables where name="members"));

insert into tables(name) values ("employments");
insert into columns(name, tableId) values ("_id", (select _id from tables where name="employments"));
insert into columns(name, tableId) values ("facilityId", (select _id from tables where name="employments"));
insert into columns(name, tableId) values ("memberId", (select _id from tables where name="employments"));
insert into columns(name, tableId) values ("functionId", (select _id from tables where name="employments"));
insert into columns(name, tableId) values ("statusId", (select _id from tables where name="employments"));
insert into columns(name, tableId) values ("startedAt", (select _id from tables where name="employments"));
insert into columns(name, tableId) values ("endedAt", (select _id from tables where name="employments"));

insert into tables(name) values ("participations");
insert into columns(name, tableId) values ("_id", (select _id from tables where name="participations"));
insert into columns(name, tableId) values ("commissionId", (select _id from tables where name="participations"));
insert into columns(name, tableId) values ("memberId", (select _id from tables where name="participations"));
insert into columns(name, tableId) values ("functionId", (select _id from tables where name="participations"));
insert into columns(name, tableId) values ("joinedAt", (select _id from tables where name="participations"));
insert into columns(name, tableId) values ("leftAt", (select _id from tables where name="participations"));
insert into columns(name, tableId) values ("representiveMemberId", (select _id from tables where name="participations"));

insert into members (firstName, lastName, description, title, phone, mail)
values ("Samuel", "Melm", "HiWi main", "Mr", "000000", "sam@foo.com");

insert into members (firstName, lastName, description, title, phone, mail)
values ("Nikita-Nick", "Funk", "HiWi main", "Mr", "000001", "nick@bar.org");

insert into members (firstName, lastName, description, title, phone, mail)
values ("Christopher", "Höllriegl", "HiWi main", "Mr", "000002", "christopher@baz.com");