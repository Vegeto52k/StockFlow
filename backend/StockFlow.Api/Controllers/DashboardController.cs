using Microsoft.AspNetCore.Mvc;
using StockFlow.Api.Dtos;
using StockFlow.Api.Repositories;

namespace StockFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public DashboardController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsResponse>> GetStats()
    {
        var orders = await _unitOfWork.Orders.GetAllAsync();
        var clients = await _unitOfWork.Clients.GetAllAsync();
        var products = await _unitOfWork.Products.GetAllAsync();

        var revenue = orders
            .Where(order => order.Status == "Validated")
            .SelectMany(order => order.Items)
            .Sum(item => item.UnitPrice * item.Quantity);

        var response = new DashboardStatsResponse
        {
            Revenue = revenue,

            OrderCount = orders.Count(),

            ClientCount = clients.Count(),

            LowStockProductCount = products.Count(
                product =>
                    product.StockQuantity <= product.MinimumStock
            )
        };

        return Ok(response);
    }
}