using Microsoft.AspNetCore.Mvc;
using StockFlow.Api.Dtos;
using StockFlow.Api.Models;
using StockFlow.Api.Repositories;

namespace StockFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StockMovementsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public StockMovementsController(
        IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<
        ActionResult<IEnumerable<StockMovementResponse>>
    > GetStockMovements()
    {
        var movements =
            await _unitOfWork.StockMovements
                .GetAllAsync();

        var response =
            movements
                .Select(MapToResponse)
                .ToList();

        return Ok(response);
    }

    [HttpGet("product/{productId:int}")]
    public async Task<
        ActionResult<IEnumerable<StockMovementResponse>>
    > GetStockMovementsByProduct(
        int productId)
    {
        var product =
            await _unitOfWork.Products
                .GetByIdAsync(productId);

        if (product is null)
        {
            return NotFound(
                "Le produit demandé n'existe pas."
            );
        }

        var movements =
            await _unitOfWork.StockMovements
                .GetByProductIdAsync(productId);

        var response =
            movements
                .Select(MapToResponse)
                .ToList();

        return Ok(response);
    }

    private static StockMovementResponse MapToResponse(
        StockMovement movement)
    {
        return new StockMovementResponse
        {
            Id =
                movement.Id,

            ProductId =
                movement.ProductId,

            ProductName =
                movement.Product?.Name
                ?? "Produit inconnu",

            OrderId =
                movement.OrderId,

            QuantityChange =
                movement.QuantityChange,

            Type =
                movement.Type,

            Reason =
                movement.Reason,

            CreatedAt =
                movement.CreatedAt
        };
    }
}