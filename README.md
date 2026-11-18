# outsourced-manufacturing-management

🏭 Integrated Outsourced Manufacturing & Distribution Management System

Team members should make changes on their own branches and open a pull request into `main` when ready for review.

### Local PostgreSQL setup for authentication

1. Copy `.env.example` to `.env` if you don't already have one. Set your local PostgreSQL credentials in `.env`.
2. On a fresh database only, import `database/sql/IOMDMS_confirmed_schema.sql`. If your database already has `iomdms.system_users`, don't re-import the schema.
3. Run the two auth migrations by path:

   ```cmd
   php artisan migrate --path=database/migrations/2026_11_17_135029_add_fortify_columns_to_system_users_table.php
   php artisan migrate --path=database/migrations/2026_11_17_164143_create_password_reset_tokens_table.php
   ```

For this setup, don't run plain `php artisan migrate`. The original Laravel starter migration also creates `password_reset_tokens`. If that table already exists because you previously ran the starter migration, don't run the second command or drop the table. Check with the team first.
