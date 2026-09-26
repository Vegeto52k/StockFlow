using StockFlow.Api.Data;

namespace StockFlow.Api.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public UnitOfWork(
        AppDbContext context,
        IClientRepository clients,
        IProductRepository products,
        IOrderRepository orders,
        IUserRepository users,
        ISupplierRepository suppliers,
        IStockMovementRepository stockMovements)
    {
        _context = context;

        Clients = clients;
        Products = products;
        Orders = orders;
        Users = users;
        Suppliers = suppliers;
        StockMovements = stockMovements;
    }

    public IClientRepository Clients { get; }

    public IProductRepository Products { get; }

    public IOrderRepository Orders { get; }

    public IUserRepository Users { get; }

    public ISupplierRepository Suppliers { get; }

    public IStockMovementRepository StockMovements { get; }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }
}