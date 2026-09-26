using StockFlow.Api.Models;

namespace StockFlow.Api.Repositories;

public interface IStockMovementRepository
{
    Task<IEnumerable<StockMovement>> GetAllAsync();

    Task<IEnumerable<StockMovement>> GetByProductIdAsync(
        int productId
    );

    Task AddAsync(StockMovement movement);
}