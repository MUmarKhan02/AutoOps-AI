using AutoOpsAI.Models;
using Microsoft.EntityFrameworkCore;

namespace AutoOpsAI.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<ProcessingJob> ProcessingJobs => Set<ProcessingJob>();
    public DbSet<ProcessingResult> ProcessingResults => Set<ProcessingResult>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        // Match the lowercase table names created by the Python backend
        mb.Entity<User>().ToTable("users");
        mb.Entity<Document>().ToTable("documents");
        mb.Entity<ProcessingJob>().ToTable("processing_jobs");
        mb.Entity<ProcessingResult>().ToTable("processing_results");

        // Column name mappings (Python uses snake_case)
        mb.Entity<User>(e => {
            e.Property(u => u.Id).HasColumnName("id");
            e.Property(u => u.Email).HasColumnName("email");
            e.Property(u => u.HashedPassword).HasColumnName("hashed_password");
            e.Property(u => u.FullName).HasColumnName("full_name");
            e.Property(u => u.IsActive).HasColumnName("is_active");
            e.Property(u => u.CreatedAt).HasColumnName("created_at");
            e.HasIndex(u => u.Email).IsUnique();
        });

        mb.Entity<Document>(e => {
            e.Property(d => d.Id).HasColumnName("id");
            e.Property(d => d.UserId).HasColumnName("user_id");
            e.Property(d => d.Filename).HasColumnName("filename");
            e.Property(d => d.OriginalName).HasColumnName("original_name");
            e.Property(d => d.FileType).HasColumnName("file_type");
            e.Property(d => d.FileSize).HasColumnName("file_size");
            e.Property(d => d.StoragePath).HasColumnName("storage_path");
            e.Property(d => d.CreatedAt).HasColumnName("created_at");
            e.HasOne(d => d.User).WithMany(u => u.Documents).HasForeignKey(d => d.UserId);
        });

        mb.Entity<ProcessingJob>(e => {
            e.Property(j => j.Id).HasColumnName("id");
            e.Property(j => j.DocumentId).HasColumnName("document_id");
            e.Property(j => j.UserId).HasColumnName("user_id");
            e.Property(j => j.Status).HasColumnName("status");
            e.Property(j => j.Stage).HasColumnName("stage");
            e.Property(j => j.CeleryTaskId).HasColumnName("celery_task_id");
            e.Property(j => j.ErrorMessage).HasColumnName("error_message");
            e.Property(j => j.CreatedAt).HasColumnName("created_at");
            e.Property(j => j.UpdatedAt).HasColumnName("updated_at");
            e.Property(j => j.CompletedAt).HasColumnName("completed_at");
            e.HasOne(j => j.Document).WithMany(d => d.Jobs).HasForeignKey(j => j.DocumentId);
        });

        mb.Entity<ProcessingResult>(e => {
            e.Property(r => r.Id).HasColumnName("id");
            e.Property(r => r.JobId).HasColumnName("job_id");
            e.Property(r => r.Summary).HasColumnName("summary");
            e.Property(r => r.ExtractedData).HasColumnName("extracted_data").HasColumnType("jsonb");
            e.Property(r => r.Chunks).HasColumnName("chunks").HasColumnType("jsonb");
            e.Property(r => r.DocMetadata).HasColumnName("doc_metadata").HasColumnType("jsonb");
            e.Property(r => r.CreatedAt).HasColumnName("created_at");
            e.HasOne(r => r.Job).WithOne(j => j.Result).HasForeignKey<ProcessingResult>(r => r.JobId);
            e.HasIndex(r => r.JobId).IsUnique();
        });
    }
}