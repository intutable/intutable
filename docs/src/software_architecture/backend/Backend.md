# Backend

As mentioned in the previous chapter, the whole application – called _intutable_ – is conceptionally divided into the classical dichotomy of a frontend and a backend. While the frontend is a single package, the backend is spread across the monorepo. In this section, we will discuss this architecture.

### Multi-Service Composition

Our backend application is a multi-service composition of a system completely written in TypeScript/Node.js and additional tools and services (like a database).

These services work together to provide an application that hosts the needs for `intutable` – various things like authentication, data storage, interfaces, etc.:

- a PostgreSQL database
- development tools
- our plugin system

### Plugin System

Despite services like a database, our backend utilizes a plugin approach to logically and conceptionally separate the different parts of the application. This way, we can easily extend the application with new features and functionalities without having to change the core application.

For example, authentication, authorization, role & permission management, single features like a personalized dashboard or data scrapers etc. are all plugins that have their own plugin.

#### Host Process

The process that hosts this plugin system is located in `/apps/backend`: a nodejs process functioning as a wrapper that imports the `core` library and all plugins from `/libs/plugins/` and initializes accordingly. It keeps an instance of the `core` library and passes configuration arguments etc. This way, it keeps the application running, because `core` encompasses a http server.
