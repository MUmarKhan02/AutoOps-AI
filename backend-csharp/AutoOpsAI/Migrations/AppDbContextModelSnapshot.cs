using AutoOpsAI.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

#nullable disable

namespace AutoOpsAI.Migrations;

[DbContext(typeof(AppDbContext))]
partial class AppDbContextModelSnapshot : ModelSnapshot
{
    protected override void BuildModel(ModelBuilder mb)
    {
#pragma warning disable 612, 618
        mb.HasAnnotation("ProductVersion", "8.0.0")
          .HasAnnotation("Relational:MaxIdentifierLength", 63);

        mb.Entity("AutoOpsAI.Models.User", b =>
        {
            b.Property<string>("Id").HasColumnType("text");
            b.Property<DateTime>("CreatedAt").HasColumnType("timestamp with time zone");
            b.Property<string>("Email").IsRequired().HasColumnType("text");
            b.Property<string>("FullName").IsRequired().HasColumnType("text");
            b.Property<string>("HashedPassword").IsRequired().HasColumnType("text");
            b.Property<bool>("IsActive").HasColumnType("boolean");
            b.HasKey("Id");
            b.HasIndex("Email").IsUnique();
            b.ToTable("users");
        });

        mb.Entity("AutoOpsAI.Models.Document", b =>
        {
            b.Property<string>("Id").HasColumnType("text");
            b.Property<DateTime>("CreatedAt").HasColumnType("timestamp with time zone");
            b.Property<string>("FileSize").HasColumnType("text");
            b.Property<string>("FileType").IsRequired().HasColumnType("text");
            b.Property<string>("Filename").IsRequired().HasColumnType("text");
            b.Property<string>("OriginalName").IsRequired().HasColumnType("text");
            b.Property<string>("StoragePath").IsRequired().HasColumnType("text");
            b.Property<string>("UserId").IsRequired().HasColumnType("text");
            b.HasKey("Id");
            b.HasIndex("UserId");
            b.ToTable("documents");
        });

        mb.Entity("AutoOpsAI.Models.ProcessingJob", b =>
        {
            b.Property<string>("Id").HasColumnType("text");
            b.Property<string>("CeleryTaskId").HasColumnType("text");
            b.Property<DateTime?>("CompletedAt").HasColumnType("timestamp with time zone");
            b.Property<DateTime>("CreatedAt").HasColumnType("timestamp with time zone");
            b.Property<string>("DocumentId").IsRequired().HasColumnType("text");
            b.Property<string>("ErrorMessage").HasColumnType("text");
            b.Property<string>("Stage").IsRequired().HasColumnType("text");
            b.Property<string>("Status").IsRequired().HasColumnType("text");
            b.Property<DateTime>("UpdatedAt").HasColumnType("timestamp with time zone");
            b.Property<string>("UserId").IsRequired().HasColumnType("text");
            b.HasKey("Id");
            b.ToTable("processing_jobs");
        });

        mb.Entity("AutoOpsAI.Models.ProcessingResult", b =>
        {
            b.Property<string>("Id").HasColumnType("text");
            b.Property<string>("Chunks").HasColumnType("jsonb");
            b.Property<DateTime>("CreatedAt").HasColumnType("timestamp with time zone");
            b.Property<string>("DocMetadata").HasColumnType("jsonb");
            b.Property<string>("ExtractedData").HasColumnType("jsonb");
            b.Property<string>("JobId").IsRequired().HasColumnType("text");
            b.Property<string>("Summary").HasColumnType("text");
            b.HasKey("Id");
            b.HasIndex("JobId").IsUnique();
            b.ToTable("processing_results");
        });
#pragma warning restore 612, 618
    }
}
