using StockFlow.Api.Models;

namespace StockFlow.Api.Repositories;

public interface IOrderRepository
{
    Task<IEnumerable<Order>> GetAllAsync();

    Task<Order?> GetByIdAsync(int id);

    Task<Order?> GetByIdForUpdateAsync(int id);

    Task<bool> ExistsForProductAsync(int productId);

    Task AddAsync(Order order);
}