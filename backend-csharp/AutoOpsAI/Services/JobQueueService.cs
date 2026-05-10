using StackExchange.Redis;
using System.Text;
using System.Text.Json;

namespace AutoOpsAI.Services;

/// <summary>
/// Pushes a document processing task to the Redis queue that the Python
/// Celery worker is listening on.
/// </summary>
public class JobQueueService(IConnectionMultiplexer redis, ILogger<JobQueueService> logger)
{
    public async Task<string> EnqueueAsync(
        string jobId, string documentId, string storagePath, string fileType)
    {
        var taskId = Guid.NewGuid().ToString();
        var db = redis.GetDatabase();

        // Celery message format — body must be base64([args, kwargs, embed])
        // where embed = {callbacks, errbacks, chain, chord}
        var args = new object[] { jobId, documentId, storagePath, fileType };
        var kwargs = new Dictionary<string, object>();
        var embed = new Dictionary<string, object?>
        {
            ["callbacks"] = null,
            ["errbacks"] = null,
            ["chain"] = null,
            ["chord"] = null
        };

        // Serialize body as JSON array of exactly 3 elements
        var bodyList = new object[] { args, kwargs, embed };
        var bodyBytes = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(bodyList));
        var bodyBase64 = Convert.ToBase64String(bodyBytes);

        var message = new Dictionary<string, object>
        {
            ["body"] = bodyBase64,
            ["content-type"] = "application/json",
            ["content-encoding"] = "utf-8",
            ["headers"] = new Dictionary<string, object?>
            {
                ["lang"] = "py",
                ["task"] = "workers.tasks.process_document",
                ["id"] = taskId,
                ["shadow"] = null,
                ["eta"] = null,
                ["expires"] = null,
                ["group"] = null,
                ["group_index"] = null,
                ["retries"] = 0,
                ["timelimit"] = new object?[] { null, null },
                ["root_id"] = taskId,
                ["parent_id"] = null,
                ["argsrepr"] = $"('{jobId}', '{documentId}', '{storagePath}', '{fileType}')",
                ["kwargsrepr"] = "{}",
                ["origin"] = "autoops-csharp"
            },
            ["properties"] = new Dictionary<string, object>
            {
                ["correlation_id"] = taskId,
                ["reply_to"] = Guid.NewGuid().ToString(),
                ["delivery_mode"] = 2,
                ["delivery_info"] = new Dictionary<string, string>
                {
                    ["exchange"] = "",
                    ["routing_key"] = "celery"
                },
                ["priority"] = 0,
                ["body_encoding"] = "base64",
                ["delivery_tag"] = Guid.NewGuid().ToString()
            }
        };

        var envelope = JsonSerializer.Serialize(message);
        await db.ListLeftPushAsync("celery", envelope);
        logger.LogInformation("Enqueued job {JobId} as Celery task {TaskId}", jobId, taskId);
        return taskId;
    }
}