using StockFlow.Api.Models;

namespace StockFlow.Api.Repositories;

public interface IOrderRepository
{
    Task<IEnumerable<Order>> GetAllAsync();

    Task<Order?> GetByIdAsync(int id);

    Task AddAsync(Order order);
}