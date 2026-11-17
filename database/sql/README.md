# IOMDMS PostgreSQL schema setup

Run these commands from the repository root in Windows Command Prompt.
Use a new local test database so the existing application database is not changed.
If the test database name already exists, choose a new name and use it in all three commands.

```cmd
psql -h 127.0.0.1 -p 5432 -U postgres -d postgres -c "CREATE DATABASE iomdms_schema_test;"
psql -h 127.0.0.1 -p 5432 -U postgres -d iomdms_schema_test -v ON_ERROR_STOP=1 -f "database\sql\IOMDMS_confirmed_schema.sql"
psql -h 127.0.0.1 -p 5432 -U postgres -d iomdms_schema_test -c "SELECT COUNT(*) AS table_count FROM information_schema.tables WHERE table_schema = 'iomdms' AND table_type = 'BASE TABLE';"
```

## Verification result

Avishka created a fresh local PostgreSQL test database named
`iomdms_schema_test_avishka` and ran the IOMDMS schema script. The script
finished with `COMMIT` without errors. She verified that all 34 tables
were created in the `iomdms` schema.
