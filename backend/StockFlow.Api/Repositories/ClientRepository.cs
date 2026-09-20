using Microsoft.EntityFrameworkCore;
using StockFlow.Api.Data;
using StockFlow.Api.Models;

namespace StockFlow.Api.Repositories;

public class ClientRepository : IClientRepository
{
    private readonly AppDbContext _context;

    public ClientRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Client>> GetAllAsync()
    {
        return await _context.Clients
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Client?> GetByIdAsync(int id)
    {
        return await _context.Clients
            .AsNoTracking()
            .FirstOrDefaultAsync(client => client.Id == id);
    }

    public async Task AddAsync(Client client)
    {
        await _context.Clients.AddAsync(client);
    }
}