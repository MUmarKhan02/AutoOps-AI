using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AutoOpsAI.Services;

public class TokenService(IConfiguration config)
{
    private readonly string _key = config["Jwt:SecretKey"]!;
    private readonly int _accessExpiry = int.Parse(config["Jwt:AccessTokenExpiryMinutes"]!);
    private readonly int _refreshExpiry = int.Parse(config["Jwt:RefreshTokenExpiryDays"]!);

    public string CreateAccessToken(string userId)
        => CreateToken(userId, TimeSpan.FromMinutes(_accessExpiry));

    public string CreateRefreshToken(string userId)
        => CreateToken(userId, TimeSpan.FromDays(_refreshExpiry), isRefresh: true);

    private string CreateToken(string userId, TimeSpan expiry, bool isRefresh = false)
    {
        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, userId) };
        if (isRefresh) claims.Add(new("type", "refresh"));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.Add(expiry),
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string? ValidateToken(string token)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_key));
            var result = handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = key,
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero,
            }, out _);
            return result.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
        catch { return null; }
    }
}
