using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutoOpsAI.Models;

public class User
{
    [Key] public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Email { get; set; } = "";
    public string HashedPassword { get; set; } = "";
    public string FullName { get; set; } = "";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Document> Documents { get; set; } = [];
}

public class Document
{
    [Key] public string Id { get; set; } = Guid.NewGuid().ToString();
    public string UserId { get; set; } = "";
    public string Filename { get; set; } = "";
    public string OriginalName { get; set; } = "";
    public string FileType { get; set; } = "";
    public long FileSize { get; set; }
    public string StoragePath { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public ICollection<ProcessingJob> Jobs { get; set; } = [];
}

public class ProcessingJob
{
    [Key] public string Id { get; set; } = Guid.NewGuid().ToString();
    public string DocumentId { get; set; } = "";
    public string UserId { get; set; } = "";
    public string Status { get; set; } = "queued";
    public string Stage { get; set; } = "queued";
    public string? CeleryTaskId { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }

    public Document? Document { get; set; }
    public ProcessingResult? Result { get; set; }
}

public class ProcessingResult
{
    [Key] public string Id { get; set; } = Guid.NewGuid().ToString();
    public string JobId { get; set; } = "";
    public string? Summary { get; set; }
    public string? ExtractedData { get; set; }  // stored as JSONB
    public string? Chunks { get; set; }          // stored as JSONB
    public string? DocMetadata { get; set; }     // stored as JSONB
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ProcessingJob? Job { get; set; }
}
