--
-- PostgreSQL database dump
--

-- Dumped from database version 13.6
-- Dumped by pg_dump version 13.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: columns; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.columns (
    _id integer NOT NULL,
    "columnName" text,
    "tableId" integer,
    type text DEFAULT 'string'::text NOT NULL
);


ALTER TABLE public.columns OWNER TO admin;

--
-- Name: columns__id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.columns__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.columns__id_seq OWNER TO admin;

--
-- Name: columns__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.columns__id_seq OWNED BY public.columns._id;


--
-- Name: jt_columns; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.jt_columns (
    _id integer NOT NULL,
    jt_id integer NOT NULL,
    join_id integer,
    column_id integer NOT NULL,
    "displayName" text,
    "userPrimary" integer DEFAULT 0 NOT NULL,
    editable integer DEFAULT 1 NOT NULL,
    editor text,
    formatter text
);


ALTER TABLE public.jt_columns OWNER TO admin;

--
-- Name: jt_columns__id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.jt_columns__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.jt_columns__id_seq OWNER TO admin;

--
-- Name: jt_columns__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.jt_columns__id_seq OWNED BY public.jt_columns._id;


--
-- Name: jt_joins; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.jt_joins (
    _id integer NOT NULL,
    jt_id integer NOT NULL,
    foreign_jt_id integer NOT NULL,
    "on" text NOT NULL
);


ALTER TABLE public.jt_joins OWNER TO admin;

--
-- Name: jt_joins__id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.jt_joins__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.jt_joins__id_seq OWNER TO admin;

--
-- Name: jt_joins__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.jt_joins__id_seq OWNED BY public.jt_joins._id;


--
-- Name: jts; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.jts (
    _id integer NOT NULL,
    name text NOT NULL,
    table_id integer NOT NULL,
    user_id integer,
    row_options text NOT NULL
);


ALTER TABLE public.jts OWNER TO admin;

--
-- Name: jts__id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.jts__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.jts__id_seq OWNER TO admin;

--
-- Name: jts__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.jts__id_seq OWNED BY public.jts._id;


--
-- Name: p1_organe; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.p1_organe (
    _id integer NOT NULL,
    name text,
    kuerzel text,
    typ text,
    fk_math_inf text
);


ALTER TABLE public.p1_organe OWNER TO admin;

--
-- Name: p1_organe__id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.p1_organe__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.p1_organe__id_seq OWNER TO admin;

--
-- Name: p1_organe__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.p1_organe__id_seq OWNED BY public.p1_organe._id;


--
-- Name: p1_personen; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.p1_personen (
    _id integer NOT NULL,
    nachname text,
    vorname text,
    m_w text,
    titel text,
    stellung text
);


ALTER TABLE public.p1_personen OWNER TO admin;

--
-- Name: p1_personen__id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.p1_personen__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.p1_personen__id_seq OWNER TO admin;

--
-- Name: p1_personen__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.p1_personen__id_seq OWNED BY public.p1_personen._id;


--
-- Name: p1_rollen; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.p1_rollen (
    _id integer NOT NULL,
    name character varying(255),
    "j#1_fk" integer,
    "j#2_fk" integer,
    rolle character varying(255)
);


ALTER TABLE public.p1_rollen OWNER TO admin;

--
-- Name: p1_rollen__id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.p1_rollen__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.p1_rollen__id_seq OWNER TO admin;

--
-- Name: p1_rollen__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.p1_rollen__id_seq OWNED BY public.p1_rollen._id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.projects (
    _id integer NOT NULL,
    "projectName" text,
    "ownerId" integer
);


ALTER TABLE public.projects OWNER TO admin;

--
-- Name: projects__id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.projects__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.projects__id_seq OWNER TO admin;

--
-- Name: projects__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.projects__id_seq OWNED BY public.projects._id;


--
-- Name: projecttables; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.projecttables (
    _id integer NOT NULL,
    "projectId" integer,
    "tableId" integer
);


ALTER TABLE public.projecttables OWNER TO admin;

--
-- Name: projecttables__id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.projecttables__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.projecttables__id_seq OWNER TO admin;

--
-- Name: projecttables__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.projecttables__id_seq OWNED BY public.projecttables._id;


--
-- Name: tables; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.tables (
    _id integer NOT NULL,
    key text NOT NULL,
    name text,
    "ownerId" integer
);


ALTER TABLE public.tables OWNER TO admin;

--
-- Name: tables__id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.tables__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tables__id_seq OWNER TO admin;

--
-- Name: tables__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.tables__id_seq OWNED BY public.tables._id;


--
-- Name: userprojects; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.userprojects (
    _id integer NOT NULL,
    "userId" integer,
    "projectId" integer
);


ALTER TABLE public.userprojects OWNER TO admin;

--
-- Name: userprojects__id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.userprojects__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.userprojects__id_seq OWNER TO admin;

--
-- Name: userprojects__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.userprojects__id_seq OWNED BY public.userprojects._id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    _id integer NOT NULL,
    email text,
    password text
);


ALTER TABLE public.users OWNER TO admin;

--
-- Name: users__id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.users__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users__id_seq OWNER TO admin;

--
-- Name: users__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.users__id_seq OWNED BY public.users._id;


--
-- Name: columns _id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.columns ALTER COLUMN _id SET DEFAULT nextval('public.columns__id_seq'::regclass);


--
-- Name: jt_columns _id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.jt_columns ALTER COLUMN _id SET DEFAULT nextval('public.jt_columns__id_seq'::regclass);


--
-- Name: jt_joins _id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.jt_joins ALTER COLUMN _id SET DEFAULT nextval('public.jt_joins__id_seq'::regclass);


--
-- Name: jts _id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.jts ALTER COLUMN _id SET DEFAULT nextval('public.jts__id_seq'::regclass);


--
-- Name: p1_organe _id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.p1_organe ALTER COLUMN _id SET DEFAULT nextval('public.p1_organe__id_seq'::regclass);


--
-- Name: p1_personen _id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.p1_personen ALTER COLUMN _id SET DEFAULT nextval('public.p1_personen__id_seq'::regclass);


--
-- Name: p1_rollen _id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.p1_rollen ALTER COLUMN _id SET DEFAULT nextval('public.p1_rollen__id_seq'::regclass);


--
-- Name: projects _id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.projects ALTER COLUMN _id SET DEFAULT nextval('public.projects__id_seq'::regclass);


--
-- Name: projecttables _id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.projecttables ALTER COLUMN _id SET DEFAULT nextval('public.projecttables__id_seq'::regclass);


--
-- Name: tables _id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.tables ALTER COLUMN _id SET DEFAULT nextval('public.tables__id_seq'::regclass);


--
-- Name: userprojects _id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.userprojects ALTER COLUMN _id SET DEFAULT nextval('public.userprojects__id_seq'::regclass);


--
-- Name: users _id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users ALTER COLUMN _id SET DEFAULT nextval('public.users__id_seq'::regclass);


--
-- Data for Name: columns; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.columns (_id, "columnName", "tableId", type) FROM stdin;
1	_id	1	string
2	nachname	1	string
3	vorname	1	string
4	m_w	1	string
5	titel	1	string
6	stellung	1	string
7	_id	2	string
8	name	2	string
9	kuerzel	2	string
10	typ	2	string
11	fk_math_inf	2	string
13	_id	4	increments
14	name	4	string
15	j#1_fk	4	integer
16	j#2_fk	4	integer
17	rolle	4	string
\.


--
-- Data for Name: jt_columns; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.jt_columns (_id, jt_id, join_id, column_id, "displayName", "userPrimary", editable, editor, formatter) FROM stdin;
1	1	\N	1	ID	0	1	number	number
2	1	\N	2	Nachname	1	1	string	string
3	1	\N	3	Vorname	0	1	string	string
4	1	\N	4	M/W	0	1	string	string
5	1	\N	5	Titel	0	1	string	string
6	1	\N	6	Stellung	0	1	string	string
7	2	\N	7	ID	0	1	number	number
8	2	\N	8	Name	1	1	string	string
9	2	\N	9	Kürzel	0	1	string	string
10	2	\N	10	Typ	0	1	string	string
11	2	\N	11	FK/Math/Inf	0	1	string	string
13	4	\N	13	ID	0	1	number	\N
14	4	\N	14	Name	1	1	string	\N
15	4	1	2	Nachname	0	0	\N	linkColumn
17	4	\N	17	Rolle	0	1	string	string
16	4	2	8	Organ	0	0	\N	linkColumn
\.


--
-- Data for Name: jt_joins; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.jt_joins (_id, jt_id, foreign_jt_id, "on") FROM stdin;
1	4	1	[15,"=",1]
2	4	2	[16,"=",7]
\.


--
-- Data for Name: jts; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.jts (_id, name, table_id, user_id, row_options) FROM stdin;
1	Personen	1	\N	{"conditions": [], "groupColumns": [], "sortColumns": [{ "column":1, "order": "asc"}]}
2	Organe	2	\N	{"conditions": [], "groupColumns": [], "sortColumns": [{ "column":7, "order": "asc"}]}
4	Rollen	4	1	{"conditions":[],"groupColumns":[],"sortColumns":[{"column":13,"order":"asc"}]}
\.


--
-- Data for Name: p1_organe; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.p1_organe (_id, name, kuerzel, typ, fk_math_inf) FROM stdin;
1	Dekanat	Dekanat	Einrichtung	FK
2	Fakultätsvorstand	FK-Vorstand	Kommission	FK
3	Institut für Angewandte Mathematik	IAM	Einrichtung	Math
4	Institut für Informatik	IfI	Einrichtung	Inf
5	Institut für Technische Informatik	ZITI	Einrichtung	Inf
6	Mathematisches Institut	MI	Einrichtung	Math
7	PA BA und MA Informatik	PA BA+MA Inf	Kommission	Inf
8	PA Informatik Promotionen	PA Prom Inf	Kommission	Inf
9	PA Lehramt Informatik	PA LA Inf	Kommission	Inf
10	PA Math Promotionen	PA Prom Math	Kommission	Math
11	StuKo Informatik	SK Inf	Kommission	Inf
12	StuKo Mathematik	SK Math	Kommission	Math
\.


--
-- Data for Name: p1_personen; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.p1_personen (_id, nachname, vorname, m_w, titel, stellung) FROM stdin;
1	Gertz	Michael	Herr	Prof.Dr.	Professor
2	Paech	Barbara	Frau	Prof.Dr.	Professor
3	Fröning	Holger	Herr	Prof.Dr.	Professor
4	Schmidt	Jan-Philip	Herr	Dr.	FK-Leitung
5	Strzodka	Robert	Herr	Prof.Dr.	Professor
6	Walcher	Johannes	Herr	Prof.Dr.	Professor
7	Knüpfer	Hannes	Herr	Prof.Dr.	Professor
8	Albers	Peter	Herr	Prof.Dr.	Professor
9	Johannes	Jan	Herr	Prof.Dr.	Professor
10	Andrzejak	Artur	Herr	Prof.Dr.	Professor
\.


--
-- Data for Name: p1_rollen; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.p1_rollen (_id, name, "j#1_fk", "j#2_fk", rolle) FROM stdin;
1	\N	10	2	Prodekan
3	\N	6	2	Dekan
4	\N	3	11	Vorsitz
5	\N	10	11	Mitglied
6	\N	7	12	Vorsitz
7	\N	2	9	Vorsitz
8	\N	4	1	Vorsitz
2	\N	10	8	Vorsitz
9	\N	6	10	Vorsitz
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.projects (_id, "projectName", "ownerId") FROM stdin;
1	Fakultät MathInf	1
\.


--
-- Data for Name: projecttables; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.projecttables (_id, "projectId", "tableId") FROM stdin;
1	1	1
2	1	2
4	1	4
\.


--
-- Data for Name: tables; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.tables (_id, key, name, "ownerId") FROM stdin;
1	p1_personen	personen	1
2	p1_organe	organe	1
4	p1_rollen	rollen	1
\.


--
-- Data for Name: userprojects; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.userprojects (_id, "userId", "projectId") FROM stdin;
1	1	1
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.users (_id, email, password) FROM stdin;
1	admin@dekanat.de	$argon2i$v=19$m=4096,t=3,p=1$vzOdnV+KUtQG3va/nlOOxg$vzo1JP16rQKYmXzQgYT9VjUXUXPA6cWHHAvXutrRHtM
\.


--
-- Name: columns__id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.columns__id_seq', 17, true);


--
-- Name: jt_columns__id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.jt_columns__id_seq', 17, true);


--
-- Name: jt_joins__id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.jt_joins__id_seq', 2, true);


--
-- Name: jts__id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.jts__id_seq', 4, true);


--
-- Name: p1_organe__id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.p1_organe__id_seq', 12, true);


--
-- Name: p1_personen__id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.p1_personen__id_seq', 10, true);


--
-- Name: p1_rollen__id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.p1_rollen__id_seq', 9, true);


--
-- Name: projects__id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.projects__id_seq', 2, true);


--
-- Name: projecttables__id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.projecttables__id_seq', 4, true);


--
-- Name: tables__id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.tables__id_seq', 4, true);


--
-- Name: userprojects__id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.userprojects__id_seq', 2, true);


--
-- Name: users__id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.users__id_seq', 2, true);


--
-- Name: columns columns_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.columns
    ADD CONSTRAINT columns_pkey PRIMARY KEY (_id);


--
-- Name: jt_columns jt_columns_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.jt_columns
    ADD CONSTRAINT jt_columns_pkey PRIMARY KEY (_id);


--
-- Name: jt_joins jt_joins_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.jt_joins
    ADD CONSTRAINT jt_joins_pkey PRIMARY KEY (_id);


--
-- Name: jts jts_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.jts
    ADD CONSTRAINT jts_pkey PRIMARY KEY (_id);


--
-- Name: p1_organe p1_organe_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.p1_organe
    ADD CONSTRAINT p1_organe_pkey PRIMARY KEY (_id);


--
-- Name: p1_personen p1_personen_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.p1_personen
    ADD CONSTRAINT p1_personen_pkey PRIMARY KEY (_id);


--
-- Name: p1_rollen p1_rollen_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.p1_rollen
    ADD CONSTRAINT p1_rollen_pkey PRIMARY KEY (_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (_id);


--
-- Name: projecttables projecttables_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.projecttables
    ADD CONSTRAINT projecttables_pkey PRIMARY KEY (_id);


--
-- Name: tables tables_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_pkey PRIMARY KEY (_id);


--
-- Name: userprojects userprojects_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.userprojects
    ADD CONSTRAINT userprojects_pkey PRIMARY KEY (_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (_id);


--
-- Name: columns columns_tableId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.columns
    ADD CONSTRAINT "columns_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES public.tables(_id);


--
-- Name: projects projects_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT "projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public.users(_id);


--
-- Name: projecttables projecttables_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.projecttables
    ADD CONSTRAINT "projecttables_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(_id);


--
-- Name: projecttables projecttables_tableId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.projecttables
    ADD CONSTRAINT "projecttables_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES public.tables(_id);


--
-- Name: tables tables_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT "tables_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public.users(_id);


--
-- Name: userprojects userprojects_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.userprojects
    ADD CONSTRAINT "userprojects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(_id);


--
-- Name: userprojects userprojects_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.userprojects
    ADD CONSTRAINT "userprojects_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(_id);


--
-- PostgreSQL database dump complete
--

