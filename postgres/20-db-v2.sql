CREATE DATABASE payments;
GRANT ALL PRIVILEGES ON DATABASE payments TO program;

CREATE DATABASE reservations;
GRANT ALL PRIVILEGES ON DATABASE reservations TO program;

CREATE DATABASE loyalties;
GRANT ALL PRIVILEGES ON DATABASE loyalties TO program;

CREATE DATABASE idp;
GRANT ALL PRIVILEGES ON DATABASE idp TO program;

CREATE DATABASE statistics;
GRANT ALL PRIVILEGES ON DATABASE statistics TO program;


\c payments
GRANT ALL PRIVILEGES ON SCHEMA public TO program;

\c reservations
GRANT ALL PRIVILEGES ON SCHEMA public TO program;

\c loyalties
GRANT ALL PRIVILEGES ON SCHEMA public TO program;

\c idp
GRANT ALL PRIVILEGES ON SCHEMA public TO program;

\c statistics
GRANT ALL PRIVILEGES ON SCHEMA public TO program;