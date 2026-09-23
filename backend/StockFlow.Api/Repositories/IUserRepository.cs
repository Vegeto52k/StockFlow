using StockFlow.Api.Models;

namespace StockFlow.Api.Repositories;

public interface IUserRepository
{
    Task<User?> GetByUsernameAsync(string username);

    Task AddAsync(User user);
}