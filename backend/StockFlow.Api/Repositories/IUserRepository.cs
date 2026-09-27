using StockFlow.Api.Models;

namespace StockFlow.Api.Repositories;

public interface IUserRepository
{
    Task<IEnumerable<User>> GetAllAsync();

    Task<User?> GetByUsernameAsync(
        string username
    );

    Task<User?> GetByUsernameForUpdateAsync(
        string username
    );

    Task<User?> GetByIdForUpdateAsync(
        int id
    );

    Task<int> CountAdminsAsync();

    Task AddAsync(
        User user
    );

    void Delete(
        User user
    );
}