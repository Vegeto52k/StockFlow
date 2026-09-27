using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using StockFlow.Api.Dtos;
using StockFlow.Api.Models;
using StockFlow.Api.Repositories;
using StockFlow.Api.Services;

namespace StockFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    private readonly IPasswordHasher<User>
        _passwordHasher;

    private readonly ITokenService _tokenService;

    public AuthController(
        IUnitOfWork unitOfWork,
        IPasswordHasher<User> passwordHasher,
        ITokenService tokenService)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(
        LoginRequest request)
    {
        var username = request.Username.Trim();

        var user =
            await _unitOfWork.Users.GetByUsernameAsync(
                username
            );

        if (user is null)
        {
            return Unauthorized(
                "Nom d'utilisateur ou mot de passe incorrect."
            );
        }

        var verificationResult =
            _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                request.Password
            );

        if (
            verificationResult ==
            PasswordVerificationResult.Failed
        )
        {
            return Unauthorized(
                "Nom d'utilisateur ou mot de passe incorrect."
            );
        }

        var token =
            _tokenService.CreateToken(user);

        return Ok(
            new AuthResponse
            {
                Token = token,
                Username = user.Username,
                Role = user.Role
            }
        );
    }
}