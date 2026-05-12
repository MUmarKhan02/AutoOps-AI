using StackExchange.Redis;
using System.Text;
using System.Text.Json;

namespace AutoOpsAI.Services;

public class JobQueueService(IConnectionMultiplexer redis, ILogger<JobQueueService> logger)
{
    public async Task<string> EnqueueAsync(
        string jobId, string documentId, string storagePath, string fileType)
    {
        var taskId = Guid.NewGuid().ToString();
        var db = redis.GetDatabase();

        // Store file content in Redis so the Python worker can access it
        // without needing a shared filesystem
        var fileKey = $"file:{jobId}";
        var fileBytes = await File.ReadAllBytesAsync(storagePath);
        var fileBase64 = Convert.ToBase64String(fileBytes);
        await db.StringSetAsync(fileKey, fileBase64, TimeSpan.FromHours(2));

        // Pass the Redis key as storage_path so the worker knows to read from Redis
        var redisStoragePath = $"redis:{fileKey}";

        var args = new object[] { jobId, documentId, redisStoragePath, fileType };
        var kwargs = new Dictionary<string, object>();
        var embed = new Dictionary<string, object?>
        {
            ["callbacks"] = null,
            ["errbacks"] = null,
            ["chain"] = null,
            ["chord"] = null
        };

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
                ["argsrepr"] = $"('{jobId}', '{documentId}', '{redisStoragePath}', '{fileType}')",
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