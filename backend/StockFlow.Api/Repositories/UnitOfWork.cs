using StockFlow.Api.Data;

namespace StockFlow.Api.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public UnitOfWork(
        AppDbContext context,
        IClientRepository clientRepository,
        IProductRepository productRepository,
        IOrderRepository orderRepository)
    {
        _context = context;

        Clients = clientRepository;
        Products = productRepository;
        Orders = orderRepository;
    }

    public IClientRepository Clients { get; }

    public IProductRepository Products { get; }

    public IOrderRepository Orders { get; }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }
}