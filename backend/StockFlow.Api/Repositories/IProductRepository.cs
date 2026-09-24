using StockFlow.Api.Models;

namespace StockFlow.Api.Repositories;

public interface IProductRepository
{
    Task<IEnumerable<Product>> GetAllAsync();

    Task<Product?> GetByIdAsync(int id);

    Task<Product?> GetByIdForUpdateAsync(int id);

    Task<bool> ExistsForSupplierAsync(int supplierId);

    Task AddAsync(Product product);

    void Delete(Product product);
}