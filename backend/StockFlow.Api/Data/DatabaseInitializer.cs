using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StockFlow.Api.Models;
using StockFlow.Api.Repositories;

namespace StockFlow.Api.Data;

public class DatabaseInitializer
{
    private readonly AppDbContext _context;

    private readonly IUnitOfWork _unitOfWork;

    private readonly IPasswordHasher<User>
        _passwordHasher;

    private readonly IConfiguration
        _configuration;

    public DatabaseInitializer(
        AppDbContext context,
        IUnitOfWork unitOfWork,
        IPasswordHasher<User> passwordHasher,
        IConfiguration configuration)
    {
        _context = context;
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _configuration = configuration;
    }

    public async Task InitializeAsync()
    {
        await _context.Database.MigrateAsync();

        var adminCount =
            await _unitOfWork.Users
                .CountAdminsAsync();

        if (adminCount > 0)
        {
            return;
        }

        var username =
            _configuration[
                "InitialAdmin:Username"
            ]?.Trim();

        var password =
            _configuration[
                "InitialAdmin:Password"
            ];

        if (
            string.IsNullOrWhiteSpace(username) ||
            username.Length < 3
        )
        {
            throw new InvalidOperationException(
                "InitialAdmin:Username doit être configuré et contenir au moins 3 caractères."
            );
        }

        if (
            string.IsNullOrWhiteSpace(password) ||
            password.Length < 8
        )
        {
            throw new InvalidOperationException(
                "InitialAdmin:Password doit être configuré et contenir au moins 8 caractères."
            );
        }

        var existingUser =
            await _unitOfWork.Users
                .GetByUsernameAsync(username);

        if (existingUser is not null)
        {
            throw new InvalidOperationException(
                $"Le compte '{username}' existe déjà mais aucun administrateur n'est configuré."
            );
        }

        var admin = new User
        {
            Username = username,
            Role = "Admin"
        };

        admin.PasswordHash =
            _passwordHasher.HashPassword(
                admin,
                password
            );

        await _unitOfWork.Users.AddAsync(
            admin
        );

        await _unitOfWork.SaveChangesAsync();
    }
}