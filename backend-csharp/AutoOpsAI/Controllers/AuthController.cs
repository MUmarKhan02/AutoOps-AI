using AutoOpsAI.Data;
using AutoOpsAI.DTOs;
using AutoOpsAI.Models;
using AutoOpsAI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.RegularExpressions;

namespace AutoOpsAI.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, TokenService tokens) : ControllerBase
{
    private static readonly Regex EmailRegex = new(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.Compiled);

    private static string? ValidatePassword(string password)
    {
        if (password.Length < 8)
            return "Password must be at least 8 characters.";
        if (!password.Any(char.IsUpper))
            return "Password must contain at least one uppercase letter.";
        if (!password.Any(char.IsLower))
            return "Password must contain at least one lowercase letter.";
        if (!password.Any(char.IsDigit))
            return "Password must contain at least one number.";
        return null;
    }

    [HttpPost("register")]
    public async Task<ActionResult<TokenResponse>> Register(RegisterRequest req)
    {
        // Validate email format
        if (string.IsNullOrWhiteSpace(req.Email) || !EmailRegex.IsMatch(req.Email))
            return BadRequest(new { detail = "Invalid email address." });

        // Validate full name
        if (string.IsNullOrWhiteSpace(req.FullName) || req.FullName.Trim().Length < 2)
            return BadRequest(new { detail = "Full name must be at least 2 characters." });

        // Validate password strength
        var passwordError = ValidatePassword(req.Password);
        if (passwordError != null)
            return BadRequest(new { detail = passwordError });

        // Check email uniqueness
        if (await db.Users.AnyAsync(u => u.Email == req.Email.ToLower()))
            return BadRequest(new { detail = "Email already registered." });

        var user = new User
        {
            Email = req.Email.ToLower().Trim(),
            HashedPassword = BCrypt.Net.BCrypt.HashPassword(req.Password),
            FullName = req.FullName.Trim(),
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        return StatusCode(201, new TokenResponse(
            tokens.CreateAccessToken(user.Id),
            tokens.CreateRefreshToken(user.Id)
        ));
    }

    [HttpPost("login")]
    public async Task<ActionResult<TokenResponse>> Login(LoginRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new { detail = "Email and password are required." });

        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email.ToLower().Trim());
        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.HashedPassword))
            return Unauthorized(new { detail = "Invalid email or password." });

        if (!user.IsActive)
            return Unauthorized(new { detail = "Account is inactive." });

        return Ok(new TokenResponse(
            tokens.CreateAccessToken(user.Id),
            tokens.CreateRefreshToken(user.Id)
        ));
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<TokenResponse>> Refresh(RefreshRequest req)
    {
        var userId = tokens.ValidateToken(req.RefreshToken);
        if (userId is null)
            return Unauthorized(new { detail = "Invalid refresh token." });

        var user = await db.Users.FindAsync(userId);
        if (user is null)
            return Unauthorized(new { detail = "User not found." });

        return Ok(new TokenResponse(
            tokens.CreateAccessToken(user.Id),
            tokens.CreateRefreshToken(user.Id)
        ));
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserOut>> Me()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = await db.Users.FindAsync(userId);
        if (user is null) return Unauthorized();

        return Ok(new UserOut(user.Id, user.Email, user.FullName, user.IsActive, user.CreatedAt));
    }
}