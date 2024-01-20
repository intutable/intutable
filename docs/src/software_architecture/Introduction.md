# Introduction to the Intutable Software Architecture

Our whole application is built on the node.js and TypeScript stack. The architecture encompasses a Next.js frontend seamlessly connected to the backend via a REST API.

```diff
+----------------------+
|   Next.js Frontend   |
+----------------------+
           ∧
           |
           v
       [REST API]
           ∧
           |
           v             
+----------------------+
|       Backend        |
+----------------------+
```

Our backend operates on a plugin architecture, anchored by a `core` library serving as a dynamic plugin manager.


```diff
+----------------------+
|       Plugin 1       |
+----------------------+
           ∧
           |
           v
+----------------------+  
|                      |                +----------------------+
|         Core         |       <–>      |       REST API       |
|   (Plugin Manager)   |       <->      |      (generated)     |
|                      |                +----------------------+
+----------------------+
           ∧
           |
           v
+----------------------+
|       Plugin 2       |
+----------------------+
```

This dynamic ecosystem fosters collaboration among multiple plugins, each contributing handlers seamlessly integrated into the express.js REST API. The core library automatically generates the REST API based on the plugins' handlers.

Additionally, our system leverages a PostgreSQL database, facilitated by a dedicated database plugin for optimal data management.

```diff
+----------------------+
|       Database       |
|        Plugin        |
+----------------------+
           ∧
           |
           v
+----------------------+
|    PostgreSQL DB     |
|       (Docker)       |
+----------------------+
```