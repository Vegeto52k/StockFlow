using StockFlow.Api.Models;

namespace StockFlow.Api.Repositories;

public interface IClientRepository
{
    Task<IEnumerable<Client>> GetAllAsync();

    Task<Client?> GetByIdAsync(int id);

    Task AddAsync(Client client);
}