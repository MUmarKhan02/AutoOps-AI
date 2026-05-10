using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoOpsAI.Migrations;

public partial class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder mb)
    {
        mb.Sql(@"
            CREATE TABLE IF NOT EXISTS users (
                id TEXT NOT NULL PRIMARY KEY,
                email TEXT NOT NULL,
                hashed_password TEXT NOT NULL,
                full_name TEXT NOT NULL,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users (email);

            CREATE TABLE IF NOT EXISTS documents (
                id TEXT NOT NULL PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                filename TEXT NOT NULL,
                original_name TEXT NOT NULL,
                file_type TEXT NOT NULL,
                file_size BIGINT NOT NULL,
                storage_path TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS processing_jobs (
                id TEXT NOT NULL PRIMARY KEY,
                document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
                user_id TEXT NOT NULL REFERENCES users(id),
                status TEXT NOT NULL DEFAULT 'queued',
                stage TEXT NOT NULL DEFAULT 'queued',
                celery_task_id TEXT,
                error_message TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                completed_at TIMESTAMPTZ
            );

            CREATE TABLE IF NOT EXISTS processing_results (
                id TEXT NOT NULL PRIMARY KEY,
                job_id TEXT NOT NULL UNIQUE REFERENCES processing_jobs(id) ON DELETE CASCADE,
                summary TEXT,
                extracted_data JSONB,
                chunks JSONB,
                doc_metadata JSONB,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        ");
    }

    protected override void Down(MigrationBuilder mb)
    {
        mb.Sql(@"
            DROP TABLE IF EXISTS processing_results;
            DROP TABLE IF EXISTS processing_jobs;
            DROP TABLE IF EXISTS documents;
            DROP TABLE IF EXISTS users;
        ");
    }
}