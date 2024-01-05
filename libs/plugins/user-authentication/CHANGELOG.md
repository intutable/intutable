# 3.0.0
### Breaking Changes
- Manage users in an own table instead of using those of PM
- Use `@intutable/database` version 4.0.0

# 2.0.0
### Breaking Changes
- Use database version 3

### New Features
- Can set database credentials with the environment variables
  `DB_RDONLY_USERNAME`, `DB_RDONLY_PASSWORD` and set the passport secret
  with `CORE_USER_AUTH_SECRET`.
