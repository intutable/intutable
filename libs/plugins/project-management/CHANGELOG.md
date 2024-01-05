# 3.1.0
Added merge and copy API

# 3.0.0
### Breaking Changes
- Projects are now global, not linked to any roles

# 2.0.0
### Breaking Changes
- Plugin does not initialize its own meta tables, the necessary schema is
  encoded in the script `/init.sql`. Doing it with TS only made things
  confusing and less rigorous.
- existing meta tables renamed, see the last portion of `/init.sql` for
  the changes.
- users no longer have email and password, only a name, and they are
  referred to as "roles".
- Use `database` version 4.0.0, which has an incompatible type for
  `openConnection`.
