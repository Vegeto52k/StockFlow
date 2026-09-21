using StockFlow.Api.Models;

namespace StockFlow.Api.Repositories;

public interface IClientRepository
{
    Task<IEnumerable<Client>> GetAllAsync();

    Task<Client?> GetByIdAsync(int id);

    Task AddAsync(Client client);

    void Update(Client client);

    void Delete(Client client);
}