namespace StockFlow.Api.Repositories;

public interface IUnitOfWork
{
    IClientRepository Clients { get; }

    Task<int> SaveChangesAsync();
}