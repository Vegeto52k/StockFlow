using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockFlow.Api.Controllers;
using StockFlow.Api.Data;
using StockFlow.Api.Dtos;
using StockFlow.Api.Models;
using StockFlow.Api.Repositories;

namespace StockFlow.Api.Tests;

public class UsersControllerTests
{
    [Fact]
    public async Task CreateUser_WithValidData_CreatesUserWithHashedPassword()
    {
        var options =
            new DbContextOptionsBuilder<AppDbContext>()
                .UseSqlite("Filename=:memory:")
                .Options;

        await using var context =
            new AppDbContext(options);

        await context.Database.OpenConnectionAsync();
        await context.Database.EnsureCreatedAsync();

        var unitOfWork =
            CreateUnitOfWork(context);

        var passwordHasher =
            new PasswordHasher<User>();

        var controller =
            new UsersController(
                unitOfWork,
                passwordHasher
            );

        var request =
            new CreateUserRequest
            {
                Username = "testuser",
                Password = "Password2026!",
                Role = "User"
            };


        var result =
            await controller.CreateUser(
                request
            );


        var objectResult =
            Assert.IsType<ObjectResult>(
                result.Result
            );

        Assert.Equal(
            StatusCodes.Status201Created,
            objectResult.StatusCode
        );

        var response =
            Assert.IsType<UserResponse>(
                objectResult.Value
            );

        Assert.Equal(
            "testuser",
            response.Username
        );

        Assert.Equal(
            "User",
            response.Role
        );


        context.ChangeTracker.Clear();


        var createdUser =
            await context.Users
                .SingleAsync();

        Assert.Equal(
            "testuser",
            createdUser.Username
        );

        Assert.Equal(
            "User",
            createdUser.Role
        );

        Assert.NotEqual(
            "Password2026!",
            createdUser.PasswordHash
        );

        var verificationResult =
            passwordHasher
                .VerifyHashedPassword(
                    createdUser,
                    createdUser.PasswordHash,
                    "Password2026!"
                );

        Assert.NotEqual(
            PasswordVerificationResult.Failed,
            verificationResult
        );
    }


    [Fact]
    public async Task UpdateRole_WhenAdminTriesToDemoteSelf_ReturnsConflict()
    {
        var options =
            new DbContextOptionsBuilder<AppDbContext>()
                .UseSqlite("Filename=:memory:")
                .Options;

        await using var context =
            new AppDbContext(options);

        await context.Database.OpenConnectionAsync();
        await context.Database.EnsureCreatedAsync();


        var admin = new User
        {
            Username = "admin",
            PasswordHash = "test-hash",
            Role = "Admin"
        };

        context.Users.Add(admin);

        await context.SaveChangesAsync();


        var unitOfWork =
            CreateUnitOfWork(context);

        var controller =
            new UsersController(
                unitOfWork,
                new PasswordHasher<User>()
            );


        var identity =
            new ClaimsIdentity(
                [
                    new Claim(
                        ClaimTypes.Name,
                        "admin"
                    )
                ],
                "TestAuthentication"
            );

        controller.ControllerContext =
            new ControllerContext
            {
                HttpContext =
                    new DefaultHttpContext
                    {
                        User =
                            new ClaimsPrincipal(
                                identity
                            )
                    }
            };


        var request =
            new UpdateUserRoleRequest
            {
                Role = "User"
            };


        var result =
            await controller.UpdateRole(
                admin.Id,
                request
            );


        var conflict =
            Assert.IsType<ConflictObjectResult>(
                result.Result
            );

        Assert.Equal(
            "Vous ne pouvez pas retirer votre propre rôle administrateur.",
            conflict.Value
        );


        context.ChangeTracker.Clear();


        var unchangedAdmin =
            await context.Users
                .SingleAsync();

        Assert.Equal(
            "Admin",
            unchangedAdmin.Role
        );
    }


    private static UnitOfWork CreateUnitOfWork(
        AppDbContext context)
    {
        return new UnitOfWork(
            context,
            new ClientRepository(context),
            new ProductRepository(context),
            new OrderRepository(context),
            new UserRepository(context),
            new SupplierRepository(context),
            new StockMovementRepository(context)
        );
    }
}