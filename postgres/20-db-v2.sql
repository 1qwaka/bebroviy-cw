CREATE DATABASE payments;
GRANT ALL PRIVILEGES ON DATABASE payments TO program;

CREATE DATABASE reservations;
GRANT ALL PRIVILEGES ON DATABASE reservations TO program;

CREATE DATABASE loyalties;
GRANT ALL PRIVILEGES ON DATABASE loyalties TO program;


\c payments
GRANT ALL PRIVILEGES ON SCHEMA public TO program;

\c reservations
GRANT ALL PRIVILEGES ON SCHEMA public TO program;

\c loyalties
GRANT ALL PRIVILEGES ON SCHEMA public TO program;