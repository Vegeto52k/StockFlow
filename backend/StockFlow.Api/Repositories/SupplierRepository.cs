using Microsoft.EntityFrameworkCore;
using StockFlow.Api.Data;
using StockFlow.Api.Models;

namespace StockFlow.Api.Repositories;

public class SupplierRepository : ISupplierRepository
{
    private readonly AppDbContext _context;

    public SupplierRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Supplier>> GetAllAsync()
    {
        return await _context.Suppliers
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Supplier?> GetByIdAsync(int id)
    {
        return await _context.Suppliers
            .AsNoTracking()
            .FirstOrDefaultAsync(
                supplier => supplier.Id == id
            );
    }

    public async Task AddAsync(Supplier supplier)
    {
        await _context.Suppliers.AddAsync(supplier);
    }

    public void Update(Supplier supplier)
    {
        _context.Suppliers.Update(supplier);
    }

    public void Delete(Supplier supplier)
    {
        _context.Suppliers.Remove(supplier);
    }
}