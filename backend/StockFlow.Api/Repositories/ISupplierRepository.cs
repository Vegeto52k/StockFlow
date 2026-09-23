using StockFlow.Api.Models;

namespace StockFlow.Api.Repositories;

public interface ISupplierRepository
{
    Task<IEnumerable<Supplier>> GetAllAsync();

    Task<Supplier?> GetByIdAsync(int id);

    Task AddAsync(Supplier supplier);

    void Update(Supplier supplier);

    void Delete(Supplier supplier);
}