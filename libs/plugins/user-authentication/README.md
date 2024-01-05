Plugin for restricting access to Core to authenticated users.

Basic guide:
`<socketaddress>` refers to the address the core's `http` plugin is
listening on.
All normal core requests of the form `<socketaddress>/<plugin>/<method>`
are blocked, only `<socketaddress>/login` is allowed. After a 
successful login with a `x-www-formdata/urlencoded` request (field names
are `username` and `password`), a cookie is returned. Core requests
with this cookie will be allowed through. Requesting `<socketaddress>/logout`
with the cookie will log the user out.

## Environment
In order to access the `database` plugin's PostgreSQL database, the
plugin will attempt to use the environment variables `DB_RDONLY_USERNAME`
and `DB_RDONLY_PASSWORD`, or use the defaults "admin" and "admin".
It is also advisable to set the session manager's secret with the environment
variable `CORE_USER_AUTH_SECRET`.  
The database must have a `users` table, copy its `CREATE` statement from
`init.sql` to add it to your database.

# Caveats
This plugin adds a middleware that adds a `userAuthCurrentUser`
property to each incoming request, because there is no other way to
get it from the session and into the core (e.g. for the `getCurrentUser`
method). Do not write methods that use this prop, or it will be overwritten
with probably disastrous and baffling consequences.

# Contributing
## Testing
The unit tests do not do much, it is more important to test that the Express
middleware works as expected.

To test this, the steps are basically:  
1. get a PostgreSQL database running.
2. Start the test server with `npm run start:server`
3. POST to the login endpoint and save the returned session cookie
4. Perform a request to the plugin's `hashPassword` or `getCurrentUser`
  method to verify that the login worked out.

### Provided Testing Facilities
Doing this with the facilities we have provided is fairly simple:
1. `npm run db:up` to start a Docker container with a database. It has
  a role with the default credentials mentioned above hard-coded into it,
  you do not need to override anything.
2. `npm run start:server` to start the test server__
If on Linux, you can use the provided scripts in the test folder:
3. `authcookie=$(tests/login sam@foo.com 123)`
4. Run the `getuser` script with the auth cookie:
  `tests/getuser $authcookie`
  You should see a response `{ "username": "sam@foo.com", "id: 1 }` or
  similar printed out.  
5. Run `tests/logout $authcookie` to log out, and try repeating step 4
  to see that you are actually logged out.
6. Ctrl-C to kill the server and `npm run db:down` to stop the database after.
If you do not have access to bash, or if you enjoy suffering,
see the [Testing Manually](testing-manually) section.


### Testing Manually
1. POST to `ip:port/login` (usually localhost:8080) with headers
`Content-Type: application/x-www-form-urlencoded` and body
`username=<username>&password=<password>` (Two example users
are created in `main.ts`, look there for the username and password)
2. copy out the response's `Set-Cookie` header and send a new POST to
`ip:port/request/user-authentication/hashPassword` with the headers
`Content-Type: application/json`, `Accept: application/json`, and
`Cookie: <the cookie you just copied>` with the payload
`{ "password": "1234" }` (don't forget the quotes!). You should get something
that looks like `{"hash":"$argon2i$v=19$m=4096,t=3,p=1$gczSksURke5PcZtRkJ5FKA$Kfv2YFTVnYh0pWMVqElCONoyIWZO6RVUJh6xUDjEnbA"}`.
3. to log out, POST to `ip:port/logout` with the cookie header. Try step #2
again (and hopefully get redirected to /login) to see that it worked.
