namespace StockFlow.Api.Repositories;

public interface IUnitOfWork
{
    IClientRepository Clients { get; }

    IProductRepository Products { get; }

    IOrderRepository Orders { get; }

    Task<int> SaveChangesAsync();
}