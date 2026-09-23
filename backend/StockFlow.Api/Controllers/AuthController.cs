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
[AllowAnonymous]
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

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(
        RegisterRequest request)
    {
        var username = request.Username.Trim();

        if (string.IsNullOrWhiteSpace(username))
        {
            return BadRequest(
                "Le nom d'utilisateur est obligatoire."
            );
        }

        if (username.Length < 3)
        {
            return BadRequest(
                "Le nom d'utilisateur doit contenir au moins 3 caractères."
            );
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(
                "Le mot de passe est obligatoire."
            );
        }

        if (request.Password.Length < 8)
        {
            return BadRequest(
                "Le mot de passe doit contenir au moins 8 caractères."
            );
        }

        var existingUser =
            await _unitOfWork.Users.GetByUsernameAsync(
                username
            );

        if (existingUser is not null)
        {
            return Conflict(
                "Ce nom d'utilisateur existe déjà."
            );
        }

        var user = new User
        {
            Username = username,
            Role = "User"
        };

        user.PasswordHash =
            _passwordHasher.HashPassword(
                user,
                request.Password
            );

        await _unitOfWork.Users.AddAsync(user);

        await _unitOfWork.SaveChangesAsync();

        var token =
            _tokenService.CreateToken(user);

        return StatusCode(
            StatusCodes.Status201Created,
            new AuthResponse
            {
                Token = token,
                Username = user.Username,
                Role = user.Role
            }
        );
    }

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