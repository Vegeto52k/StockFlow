using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using StockFlow.Api.Dtos;
using StockFlow.Api.Models;
using StockFlow.Api.Repositories;

namespace StockFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    private readonly IPasswordHasher<User>
        _passwordHasher;

    public UsersController(
        IUnitOfWork unitOfWork,
        IPasswordHasher<User> passwordHasher)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserResponse>>>
        GetUsers()
    {
        var users =
            await _unitOfWork.Users.GetAllAsync();

        var response =
            users.Select(
                user => new UserResponse
                {
                    Id = user.Id,
                    Username = user.Username,
                    Role = user.Role
                }
            );

        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<UserResponse>>
        CreateUser(
            CreateUserRequest request)
    {
        var username =
            request.Username.Trim();

        if (username.Length < 3)
        {
            return BadRequest(
                "Le nom d'utilisateur doit contenir au moins 3 caractères."
            );
        }

        if (
            string.IsNullOrWhiteSpace(
                request.Password
            ) ||
            request.Password.Length < 8
        )
        {
            return BadRequest(
                "Le mot de passe doit contenir au moins 8 caractères."
            );
        }

        var role =
            request.Role.Trim();

        if (
            role != "Admin" &&
            role != "User"
        )
        {
            return BadRequest(
                "Le rôle doit être Admin ou User."
            );
        }

        var existingUser =
            await _unitOfWork.Users
                .GetByUsernameAsync(username);

        if (existingUser is not null)
        {
            return Conflict(
                "Ce nom d'utilisateur existe déjà."
            );
        }

        var user = new User
        {
            Username = username,
            Role = role
        };

        user.PasswordHash =
            _passwordHasher.HashPassword(
                user,
                request.Password
            );

        await _unitOfWork.Users.AddAsync(
            user
        );

        await _unitOfWork.SaveChangesAsync();

        return StatusCode(
            StatusCodes.Status201Created,
            new UserResponse
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role
            }
        );
    }

    [HttpPut("{id:int}/role")]
    public async Task<ActionResult<UserResponse>>
        UpdateRole(
            int id,
            UpdateUserRoleRequest request)
    {
        var role =
            request.Role.Trim();

        if (
            role != "Admin" &&
            role != "User"
        )
        {
            return BadRequest(
                "Le rôle doit être Admin ou User."
            );
        }

        var user =
            await _unitOfWork.Users
                .GetByIdForUpdateAsync(id);

        if (user is null)
        {
            return NotFound(
                "L'utilisateur demandé n'existe pas."
            );
        }

        var currentUsername =
            User.Identity?.Name;

        if (
            user.Username == currentUsername &&
            role != "Admin"
        )
        {
            return Conflict(
                "Vous ne pouvez pas retirer votre propre rôle administrateur."
            );
        }

        if (
            user.Role == "Admin" &&
            role != "Admin"
        )
        {
            var adminCount =
                await _unitOfWork.Users
                    .CountAdminsAsync();

            if (adminCount <= 1)
            {
                return Conflict(
                    "Le dernier administrateur ne peut pas être rétrogradé."
                );
            }
        }

        user.Role = role;

        await _unitOfWork.SaveChangesAsync();

        return Ok(
            new UserResponse
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role
            }
        );
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteUser(
        int id)
    {
        var user =
            await _unitOfWork.Users
                .GetByIdForUpdateAsync(id);

        if (user is null)
        {
            return NotFound(
                "L'utilisateur demandé n'existe pas."
            );
        }

        var currentUsername =
            User.Identity?.Name;

        if (user.Username == currentUsername)
        {
            return Conflict(
                "Vous ne pouvez pas supprimer votre propre compte."
            );
        }

        if (user.Role == "Admin")
        {
            var adminCount =
                await _unitOfWork.Users
                    .CountAdminsAsync();

            if (adminCount <= 1)
            {
                return Conflict(
                    "Le dernier administrateur ne peut pas être supprimé."
                );
            }
        }

        _unitOfWork.Users.Delete(
            user
        );

        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }
}