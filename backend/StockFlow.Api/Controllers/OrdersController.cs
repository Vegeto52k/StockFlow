using Microsoft.AspNetCore.Mvc;
using StockFlow.Api.Dtos;
using StockFlow.Api.Models;
using StockFlow.Api.Repositories;

namespace StockFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public OrdersController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderResponse>>> GetOrders()
    {
        var orders = await _unitOfWork.Orders.GetAllAsync();

        var response = orders
            .Select(MapOrderToResponse)
            .ToList();

        return Ok(response);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderResponse>> GetOrderById(int id)
    {
        var order = await _unitOfWork.Orders.GetByIdAsync(id);

        if (order is null)
        {
            return NotFound();
        }

        return Ok(MapOrderToResponse(order));
    }

    [HttpPost]
    public async Task<ActionResult<OrderResponse>> CreateOrder(
        CreateOrderRequest request)
    {
        var client = await _unitOfWork.Clients.GetByIdAsync(
            request.ClientId
        );

        if (client is null)
        {
            return BadRequest(
                "Le client sélectionné n'existe pas."
            );
        }

        if (request.Items.Count == 0)
        {
            return BadRequest(
                "La commande doit contenir au moins un produit."
            );
        }

        if (request.Items.Any(item => item.Quantity <= 0))
        {
            return BadRequest(
                "Toutes les quantités doivent être supérieures à zéro."
            );
        }

        var duplicateProductIds = request.Items
            .GroupBy(item => item.ProductId)
            .Where(group => group.Count() > 1)
            .Select(group => group.Key)
            .ToList();

        if (duplicateProductIds.Count > 0)
        {
            return BadRequest(
                "Un produit ne peut apparaître qu'une seule fois dans la commande."
            );
        }

        var order = new Order
        {
            ClientId = request.ClientId,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        foreach (var requestedItem in request.Items)
        {
            var product =
                await _unitOfWork.Products.GetByIdAsync(
                    requestedItem.ProductId
                );

            if (product is null)
            {
                return BadRequest(
                    $"Le produit {requestedItem.ProductId} n'existe pas."
                );
            }

            if (product.StockQuantity < requestedItem.Quantity)
            {
                return BadRequest(
                    $"Stock insuffisant pour le produit {product.Name}."
                );
            }

            product.StockQuantity -= requestedItem.Quantity;

            _unitOfWork.Products.Update(product);

            order.Items.Add(
                new OrderItem
                {
                    ProductId = product.Id,
                    Quantity = requestedItem.Quantity,
                    UnitPrice = product.UnitPrice
                }
            );
        }

        await _unitOfWork.Orders.AddAsync(order);

        await _unitOfWork.SaveChangesAsync();

        var createdOrder =
            await _unitOfWork.Orders.GetByIdAsync(order.Id);

        if (createdOrder is null)
        {
            return StatusCode(500);
        }

        var response = MapOrderToResponse(createdOrder);

        return CreatedAtAction(
            nameof(GetOrderById),
            new { id = order.Id },
            response
        );
    }

    private static OrderResponse MapOrderToResponse(Order order)
    {
        return new OrderResponse
        {
            Id = order.Id,
            CreatedAt = order.CreatedAt,
            Status = order.Status,
            ClientId = order.ClientId,

            Client = order.Client is null
                ? null
                : new OrderClientResponse
                {
                    Id = order.Client.Id,
                    Name = order.Client.Name,
                    Email = order.Client.Email,
                    Phone = order.Client.Phone,
                    City = order.Client.City
                },

            Items = order.Items
                .Select(item => new OrderItemResponse
                {
                    Id = item.Id,
                    OrderId = item.OrderId,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,

                    Product = item.Product is null
                        ? null
                        : new OrderProductResponse
                        {
                            Id = item.Product.Id,
                            Name = item.Product.Name,
                            Reference = item.Product.Reference,
                            Category = item.Product.Category,
                            UnitPrice = item.Product.UnitPrice,
                            StockQuantity = item.Product.StockQuantity,
                            MinimumStock = item.Product.MinimumStock
                        }
                })
                .ToList()
        };
    }
}