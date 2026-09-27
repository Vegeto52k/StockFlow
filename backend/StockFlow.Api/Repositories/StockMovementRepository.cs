using Microsoft.EntityFrameworkCore;
using StockFlow.Api.Data;
using StockFlow.Api.Models;

namespace StockFlow.Api.Repositories;

public class StockMovementRepository
    : IStockMovementRepository
{
    private readonly AppDbContext _context;

    public StockMovementRepository(
        AppDbContext context
    )
    {
        _context = context;
    }

    public async Task<IEnumerable<StockMovement>>
        GetAllAsync()
    {
        return await _context.StockMovements
            .AsNoTracking()
            .Include(movement => movement.Product)
            .OrderByDescending(
                movement => movement.CreatedAt
            )
            .ToListAsync();
    }

    public async Task<IEnumerable<StockMovement>>
        GetByProductIdAsync(
            int productId
        )
    {
        return await _context.StockMovements
            .AsNoTracking()
            .Include(movement => movement.Product)
            .Where(
                movement =>
                    movement.ProductId == productId
            )
            .OrderByDescending(
                movement => movement.CreatedAt
            )
            .ToListAsync();
    }

    public async Task<bool>
        ExistsForProductAsync(
            int productId
        )
    {
        return await _context.StockMovements
            .AnyAsync(
                movement =>
                    movement.ProductId == productId
            );
    }

    public async Task AddAsync(
        StockMovement movement
    )
    {
        await _context.StockMovements.AddAsync(
            movement
        );
    }
}