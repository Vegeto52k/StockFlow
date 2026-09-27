using Microsoft.EntityFrameworkCore;
using StockFlow.Api.Data;
using StockFlow.Api.Models;

namespace StockFlow.Api.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(
        AppDbContext context
    )
    {
        _context = context;
    }

    public async Task<IEnumerable<User>>
        GetAllAsync()
    {
        return await _context.Users
            .AsNoTracking()
            .OrderBy(
                user => user.Username
            )
            .ToListAsync();
    }

    public async Task<User?>
        GetByUsernameAsync(
            string username
        )
    {
        return await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(
                user =>
                    user.Username == username
            );
    }

    public async Task<User?>
        GetByUsernameForUpdateAsync(
            string username
        )
    {
        return await _context.Users
            .FirstOrDefaultAsync(
                user =>
                    user.Username == username
            );
    }

    public async Task<User?>
        GetByIdForUpdateAsync(
            int id
        )
    {
        return await _context.Users
            .FirstOrDefaultAsync(
                user =>
                    user.Id == id
            );
    }

    public async Task<int>
        CountAdminsAsync()
    {
        return await _context.Users
            .CountAsync(
                user =>
                    user.Role == "Admin"
            );
    }

    public async Task AddAsync(
        User user
    )
    {
        await _context.Users.AddAsync(
            user
        );
    }

    public void Delete(
        User user
    )
    {
        _context.Users.Remove(
            user
        );
    }
}