DROP TABLE IF EXISTS users;

-- introduced with v3.0.0: users table managed by plugin itself
CREATE TABLE users(
  _id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  password TEXT NOT NULL
);

INSERT INTO users (username, password) VALUES (
  'sam@foo.com',
  '$argon2i$v=19$m=4096,t=3,p=1$b5hIq52zhxIoeZre7qD7LQ$WGI8qqZ3ovRGDocHCeLVP8veLAWTHxHQI4tzowy3B7A'
); -- pw: 123

INSERT INTO users (username, password) VALUES (
  'nick@bar.org',
  '$argon2i$v=19$m=4096,t=3,p=1$ZxdMpsv2kODzUThTz08YGg$NB/NfE8lY+2ov7f/NeyrJJMVw0tF7E4hiEgL5lFydEI'
); -- pw: password
