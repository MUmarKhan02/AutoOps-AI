using System.Text.Json.Serialization;

namespace AutoOpsAI.DTOs;

// ── Auth ──────────────────────────────────────────────────────────────────────

public record RegisterRequest(
    string Email,
    string Password,
    [property: JsonPropertyName("full_name")] string FullName
);

public record LoginRequest(string Email, string Password);

public record RefreshRequest([property: JsonPropertyName("refresh_token")] string RefreshToken);

public record TokenResponse(
    [property: JsonPropertyName("access_token")]  string AccessToken,
    [property: JsonPropertyName("refresh_token")] string RefreshToken,
    [property: JsonPropertyName("token_type")]    string TokenType = "bearer"
);

public record UserOut(
    string Id,
    string Email,
    [property: JsonPropertyName("full_name")] string FullName,
    [property: JsonPropertyName("is_active")] bool IsActive,
    [property: JsonPropertyName("created_at")] DateTime CreatedAt
);

// ── Documents ─────────────────────────────────────────────────────────────────

public record DocumentOut(
    string Id,
    string Filename,
    [property: JsonPropertyName("original_name")] string OriginalName,
    [property: JsonPropertyName("file_type")] string FileType,
    [property: JsonPropertyName("file_size")] long FileSize,
    [property: JsonPropertyName("created_at")] DateTime CreatedAt
);

// ── Jobs ──────────────────────────────────────────────────────────────────────

public record JobOut(
    string Id,
    [property: JsonPropertyName("document_id")] string DocumentId,
    string Status,
    string Stage,
    [property: JsonPropertyName("error_message")] string? ErrorMessage,
    [property: JsonPropertyName("created_at")] DateTime CreatedAt,
    [property: JsonPropertyName("updated_at")] DateTime UpdatedAt,
    [property: JsonPropertyName("completed_at")] DateTime? CompletedAt,
    DocumentOut? Document
);

public record ResultOut(
    string Id,
    [property: JsonPropertyName("job_id")] string JobId,
    string? Summary,
    [property: JsonPropertyName("extracted_data")] object? ExtractedData,
    object? Chunks,
    [property: JsonPropertyName("doc_metadata")] object? DocMetadata,
    [property: JsonPropertyName("created_at")] DateTime CreatedAt
);
