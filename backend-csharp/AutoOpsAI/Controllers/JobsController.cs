using AutoOpsAI.Data;
using AutoOpsAI.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace AutoOpsAI.Controllers;

[ApiController]
[Route("api/jobs")]
[Authorize]
public class JobsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<JobOut>>> List()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        var jobs = await db.ProcessingJobs
            .Include(j => j.Document)
            .Where(j => j.UserId == userId)
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync();

        return Ok(jobs.Select(Map));
    }

    [HttpGet("{jobId}")]
    public async Task<ActionResult<JobOut>> Get(string jobId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        var job = await db.ProcessingJobs
            .Include(j => j.Document)
            .FirstOrDefaultAsync(j => j.Id == jobId && j.UserId == userId);

        if (job is null) return NotFound(new { detail = "Job not found" });
        return Ok(Map(job));
    }

    [HttpGet("{jobId}/result")]
    public async Task<ActionResult<ResultOut>> GetResult(string jobId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        var result = await db.ProcessingResults
            .Include(r => r.Job)
            .FirstOrDefaultAsync(r => r.JobId == jobId && r.Job!.UserId == userId);

        if (result is null) return NotFound(new { detail = "Result not found" });

        return Ok(new ResultOut(
            result.Id, result.JobId, result.Summary,
            ParseJson(result.ExtractedData),
            ParseJson(result.Chunks),
            ParseJson(result.DocMetadata),
            result.CreatedAt
        ));
    }

    /// <summary>
    /// Server-Sent Events endpoint — polls DB every 2s and pushes status updates.
    /// EventSource can't send Authorization headers so token comes via ?token= query param.
    /// </summary>
    [HttpGet("{jobId}/stream")]
    public async Task Stream(string jobId, CancellationToken ct)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;

        Response.Headers.Append("Content-Type", "text/event-stream");
        Response.Headers.Append("Cache-Control", "no-cache");
        Response.Headers.Append("X-Accel-Buffering", "no");

        while (!ct.IsCancellationRequested)
        {
            var job = await db.ProcessingJobs
                .AsNoTracking()
                .FirstOrDefaultAsync(j => j.Id == jobId && j.UserId == userId, ct);

            if (job is null)
            {
                await WriteEvent(Response, new { error = "Job not found" }, ct);
                break;
            }

            var payload = new
            {
                job_id = job.Id,
                status = job.Status,
                stage = job.Stage,
                updated_at = job.UpdatedAt.ToString("o"),
            };

            await WriteEvent(Response, payload, ct);

            if (job.Status is "completed" or "failed") break;

            await Task.Delay(2000, ct);
        }
    }

    private static async Task WriteEvent(HttpResponse response, object data, CancellationToken ct)
    {
        var json = JsonSerializer.Serialize(data);
        var line = $"data: {json}\n\n";
        await response.Body.WriteAsync(Encoding.UTF8.GetBytes(line), ct);
        await response.Body.FlushAsync(ct);
    }

    private static object? ParseJson(string? json)
    {
        if (string.IsNullOrEmpty(json)) return null;
        try { return JsonSerializer.Deserialize<object>(json); }
        catch { return null; }
    }

    private static JobOut Map(AutoOpsAI.Models.ProcessingJob job)
    {
        DocumentOut? docOut = null;
        if (job.Document is not null)
        {
            var d = job.Document;
            docOut = new DocumentOut(d.Id, d.Filename, d.OriginalName, d.FileType, d.FileSize, d.CreatedAt);
        }
        return new JobOut(
            job.Id, job.DocumentId, job.Status, job.Stage,
            job.ErrorMessage, job.CreatedAt, job.UpdatedAt, job.CompletedAt,
            docOut
        );
    }
}
