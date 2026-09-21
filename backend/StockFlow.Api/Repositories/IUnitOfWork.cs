namespace StockFlow.Api.Repositories;

public interface IUnitOfWork
{
    IClientRepository Clients { get; }

    IProductRepository Products { get; }

    Task<int> SaveChangesAsync();
}