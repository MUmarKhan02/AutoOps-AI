using AutoOpsAI.Data;
using AutoOpsAI.DTOs;
using AutoOpsAI.Models;
using AutoOpsAI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AutoOpsAI.Controllers;

[ApiController]
[Route("api/documents")]
[Authorize]
public class DocumentsController(
    AppDbContext db,
    JobQueueService queue,
    IConfiguration config,
    ILogger<DocumentsController> logger) : ControllerBase
{
    private static readonly Dictionary<string, string> AllowedTypes = new()
    {
        ["application/pdf"] = "pdf",
        ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"] = "docx",
        ["text/plain"] = "txt",
    };

    [HttpPost("upload")]
    public async Task<ActionResult<JobOut>> Upload(IFormFile file)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        var maxMb = int.Parse(config["Storage:MaxFileSizeMb"] ?? "20");

        if (!AllowedTypes.TryGetValue(file.ContentType, out var fileType))
            return BadRequest(new { detail = "Unsupported file type. Use PDF, DOCX, or TXT." });

        if (file.Length > maxMb * 1024 * 1024)
            return StatusCode(413, new { detail = $"File exceeds {maxMb}MB limit" });

        // Save file
        var uploadDir = config["Storage:UploadDir"]!;
        var userDir = Path.Combine(uploadDir, userId);
        Directory.CreateDirectory(userDir);

        var uniqueName = $"{Guid.NewGuid()}.{fileType}";
        var storagePath = Path.Combine(userDir, uniqueName);

        await using (var stream = System.IO.File.Create(storagePath))
            await file.CopyToAsync(stream);

        // Create document record
        var document = new Document
        {
            UserId = userId,
            Filename = uniqueName,
            OriginalName = file.FileName,
            FileType = fileType,
            FileSize = file.Length,
            StoragePath = storagePath,
        };
        db.Documents.Add(document);
        await db.SaveChangesAsync();

        // Create job
        var job = new ProcessingJob
        {
            DocumentId = document.Id,
            UserId = userId,
        };
        db.ProcessingJobs.Add(job);
        await db.SaveChangesAsync();

        // Dispatch to Python Celery worker via Redis
        var taskId = await queue.EnqueueAsync(job.Id, document.Id, storagePath, fileType);
        job.CeleryTaskId = taskId;
        await db.SaveChangesAsync();

        logger.LogInformation("Uploaded {FileName} → job {JobId}", file.FileName, job.Id);

        return StatusCode(201, MapJob(job, document));
    }

    [HttpGet]
    public async Task<ActionResult<List<DocumentOut>>> List()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        var docs = await db.Documents
            .Where(d => d.UserId == userId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

        return Ok(docs.Select(d => new DocumentOut(
            d.Id, d.Filename, d.OriginalName, d.FileType, d.FileSize, d.CreatedAt)));
    }

    private static JobOut MapJob(ProcessingJob job, Document doc) => new(
        job.Id, job.DocumentId, job.Status, job.Stage,
        job.ErrorMessage, job.CreatedAt, job.UpdatedAt, job.CompletedAt,
        new DocumentOut(doc.Id, doc.Filename, doc.OriginalName, doc.FileType, doc.FileSize, doc.CreatedAt)
    );
}
