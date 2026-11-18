<?php

namespace Tests\Concerns;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use RuntimeException;

trait RefreshIomdmsDatabase
{
    use RefreshDatabase;

    protected function migrateDatabases(): void
    {
        $connection = DB::connection();

        if (
            !app()->environment('testing') ||
            $connection->getDriverName() !== 'pgsql' ||
            $connection->getDatabaseName() !== 'iomdms_test'
        ) {
            throw new RuntimeException(
                'Database reset requires the PostgreSQL iomdms_test database in the testing environment.'
            );
        }

        $schema = file_get_contents(
            database_path('sql/IOMDMS_confirmed_schema.sql')
        );

        if ($schema === false) {
            throw new RuntimeException('Could not read the IOMDMS schema SQL.');
        }

        $connection->unprepared('DROP SCHEMA IF EXISTS iomdms CASCADE');
        $connection->unprepared('DROP TABLE IF EXISTS public.password_reset_tokens');
        $connection->unprepared('DROP TABLE IF EXISTS public.migrations');
        $connection->unprepared($schema);

        $this->artisan('migrate', [
            '--path' => [
                'database/migrations/2026_11_17_135029_add_fortify_columns_to_system_users_table.php',
                'database/migrations/2026_11_17_164143_create_password_reset_tokens_table.php',
            ],
            '--force' => true,
        ])->assertExitCode(0);
    }
}
