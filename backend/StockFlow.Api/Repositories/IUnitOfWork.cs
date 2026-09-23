namespace StockFlow.Api.Repositories;

public interface IUnitOfWork
{
    IClientRepository Clients { get; }

    IProductRepository Products { get; }

    IOrderRepository Orders { get; }

    IUserRepository Users { get; }

    Task<int> SaveChangesAsync();
}