using StockFlow.Api.Models;

namespace StockFlow.Api.Repositories;

public interface IProductRepository
{
    Task<IEnumerable<Product>> GetAllAsync();

    Task<Product?> GetByIdAsync(int id);

    Task AddAsync(Product product);

    void Update(Product product);

    void Delete(Product product);
}