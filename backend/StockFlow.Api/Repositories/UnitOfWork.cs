using StockFlow.Api.Data;

namespace StockFlow.Api.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public UnitOfWork(
        AppDbContext context,
        IClientRepository clientRepository)
    {
        _context = context;
        Clients = clientRepository;
    }

    public IClientRepository Clients { get; }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }
}