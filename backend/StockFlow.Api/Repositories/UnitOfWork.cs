using StockFlow.Api.Data;

namespace StockFlow.Api.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public UnitOfWork(
        AppDbContext context,
        IClientRepository clientRepository,
        IProductRepository productRepository)
    {
        _context = context;

        Clients = clientRepository;
        Products = productRepository;
    }

    public IClientRepository Clients { get; }

    public IProductRepository Products { get; }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }
}