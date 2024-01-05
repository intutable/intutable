# `project-management`
A Core plugin built on the `database` plugin that allows editing
SQL tables while maintaining its own metadata. This is a first step in apps
that allow users to edit their table schemas.

### Database Schema
This plugin requires that the database its requests are made against
have the meta tables already set up. The script `./init.sql` describes this
schema. Changes to the schema will be made in the form of a block of
`ALTER` statements that you can just copy into a script to migrate your
existing database. (There are none so far). See the changelog for info,
once it exists.
