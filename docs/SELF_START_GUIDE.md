# Local setup

Follow the tested commands in [README](../README.md).

Generate a private `.env` once, start PostgreSQL, then the API and web application. Register an account and explicitly load synthetic demo leads. An empty account is expected.

If the API refuses to start, check `DATABASE_URL` and a random `JWT_SECRET` of at least 32 characters. Never paste secrets into logs or support messages.
