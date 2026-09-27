using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockFlow.Api.Controllers;
using StockFlow.Api.Data;
using StockFlow.Api.Dtos;
using StockFlow.Api.Models;
using StockFlow.Api.Repositories;

namespace StockFlow.Api.Tests;

public class OrdersControllerTests
{
    [Fact]
    public async Task CreateOrder_WithSufficientStock_DecrementsStockAndCreatesMovement()
    {
        var options =
            new DbContextOptionsBuilder<AppDbContext>()
                .UseSqlite("Filename=:memory:")
                .Options;

        await using var context =
            new AppDbContext(options);

        await context.Database.OpenConnectionAsync();
        await context.Database.EnsureCreatedAsync();

        var client = new Client
        {
            Name = "Client Test",
            Email = "client@test.fr",
            Phone = "0102030405",
            City = "Marseille"
        };

        var product = new Product
        {
            Name = "Clavier mécanique",
            Reference = "CLAV-001",
            Category = "Informatique",
            UnitPrice = 100m,
            StockQuantity = 10,
            MinimumStock = 2
        };

        context.Clients.Add(client);
        context.Products.Add(product);

        await context.SaveChangesAsync();

        var unitOfWork =
            CreateUnitOfWork(context);

        var controller =
            new OrdersController(unitOfWork);

        var request =
            new CreateOrderRequest
            {
                ClientId = client.Id,

                Items =
                [
                    new CreateOrderItemRequest
                    {
                        ProductId = product.Id,
                        Quantity = 3
                    }
                ]
            };

        var result =
            await controller.CreateOrder(
                request
            );

        var createdResult =
            Assert.IsType<CreatedAtActionResult>(
                result.Result
            );

        Assert.NotNull(
            createdResult.Value
        );

        context.ChangeTracker.Clear();

        var updatedProduct =
            await context.Products
                .SingleAsync(
                    currentProduct =>
                        currentProduct.Id ==
                        product.Id
                );

        Assert.Equal(
            7,
            updatedProduct.StockQuantity
        );

        var order =
            await context.Orders
                .Include(
                    currentOrder =>
                        currentOrder.Items
                )
                .SingleAsync();

        Assert.Equal(
            "Pending",
            order.Status
        );

        Assert.Single(
            order.Items
        );

        Assert.Equal(
            3,
            order.Items[0].Quantity
        );

        Assert.Equal(
            100m,
            order.Items[0].UnitPrice
        );

        var movement =
            await context.StockMovements
                .SingleAsync();

        Assert.Equal(
            product.Id,
            movement.ProductId
        );

        Assert.Equal(
            -3,
            movement.QuantityChange
        );

        Assert.Equal(
            "Order",
            movement.Type
        );

        Assert.Equal(
            order.Id,
            movement.OrderId
        );
    }


    [Fact]
    public async Task CreateOrder_WithInsufficientStock_DoesNotCreateOrderOrChangeStock()
    {
        var options =
            new DbContextOptionsBuilder<AppDbContext>()
                .UseSqlite("Filename=:memory:")
                .Options;

        await using var context =
            new AppDbContext(options);

        await context.Database.OpenConnectionAsync();
        await context.Database.EnsureCreatedAsync();

        var client = new Client
        {
            Name = "Client Test",
            Email = "client@test.fr",
            Phone = "0102030405",
            City = "Marseille"
        };

        var product = new Product
        {
            Name = "Clavier mécanique",
            Reference = "CLAV-001",
            Category = "Informatique",
            UnitPrice = 100m,
            StockQuantity = 10,
            MinimumStock = 2
        };

        context.Clients.Add(client);
        context.Products.Add(product);

        await context.SaveChangesAsync();

        var unitOfWork =
            CreateUnitOfWork(context);

        var controller =
            new OrdersController(unitOfWork);

        var request =
            new CreateOrderRequest
            {
                ClientId = client.Id,

                Items =
                [
                    new CreateOrderItemRequest
                    {
                        ProductId = product.Id,
                        Quantity = 11
                    }
                ]
            };

        var result =
            await controller.CreateOrder(
                request
            );

        var badRequest =
            Assert.IsType<BadRequestObjectResult>(
                result.Result
            );

        Assert.Equal(
            "Stock insuffisant pour le produit Clavier mécanique.",
            badRequest.Value
        );

        context.ChangeTracker.Clear();

        var unchangedProduct =
            await context.Products
                .SingleAsync(
                    currentProduct =>
                        currentProduct.Id ==
                        product.Id
                );

        Assert.Equal(
            10,
            unchangedProduct.StockQuantity
        );

        Assert.Equal(
            0,
            await context.Orders.CountAsync()
        );

        Assert.Equal(
            0,
            await context.StockMovements.CountAsync()
        );
    }


    [Fact]
    public async Task CancelOrder_RestoresStockAndCreatesCancellationMovement()
    {
        var options =
            new DbContextOptionsBuilder<AppDbContext>()
                .UseSqlite("Filename=:memory:")
                .Options;

        await using var context =
            new AppDbContext(options);

        await context.Database.OpenConnectionAsync();
        await context.Database.EnsureCreatedAsync();

        var client = new Client
        {
            Name = "Client Test",
            Email = "client@test.fr",
            Phone = "0102030405",
            City = "Marseille"
        };

        var product = new Product
        {
            Name = "Clavier mécanique",
            Reference = "CLAV-001",
            Category = "Informatique",
            UnitPrice = 100m,
            StockQuantity = 10,
            MinimumStock = 2
        };

        context.Clients.Add(client);
        context.Products.Add(product);

        await context.SaveChangesAsync();

        var unitOfWork =
            CreateUnitOfWork(context);

        var controller =
            new OrdersController(unitOfWork);

        var createRequest =
            new CreateOrderRequest
            {
                ClientId = client.Id,

                Items =
                [
                    new CreateOrderItemRequest
                    {
                        ProductId = product.Id,
                        Quantity = 3
                    }
                ]
            };

        var createResult =
            await controller.CreateOrder(
                createRequest
            );

        Assert.IsType<CreatedAtActionResult>(
            createResult.Result
        );

        context.ChangeTracker.Clear();

        var createdOrder =
            await context.Orders
                .SingleAsync();

        var productAfterOrder =
            await context.Products
                .SingleAsync();

        Assert.Equal(
            7,
            productAfterOrder.StockQuantity
        );

        context.ChangeTracker.Clear();

        var cancelRequest =
            new UpdateOrderStatusRequest
            {
                Status = "Cancelled"
            };

        var cancelResult =
            await controller.UpdateOrderStatus(
                createdOrder.Id,
                cancelRequest
            );

        var okResult =
            Assert.IsType<OkObjectResult>(
                cancelResult.Result
            );

        Assert.NotNull(
            okResult.Value
        );

        context.ChangeTracker.Clear();

        var productAfterCancellation =
            await context.Products
                .SingleAsync();

        Assert.Equal(
            10,
            productAfterCancellation.StockQuantity
        );

        var cancelledOrder =
            await context.Orders
                .SingleAsync();

        Assert.Equal(
            "Cancelled",
            cancelledOrder.Status
        );

        var movements =
            await context.StockMovements
                .OrderBy(
                    movement => movement.Id
                )
                .ToListAsync();

        Assert.Equal(
            2,
            movements.Count
        );

        var orderMovement =
            Assert.Single(
                movements,
                movement =>
                    movement.Type == "Order"
            );

        Assert.Equal(
            -3,
            orderMovement.QuantityChange
        );

        Assert.Equal(
            cancelledOrder.Id,
            orderMovement.OrderId
        );

        var cancellationMovement =
            Assert.Single(
                movements,
                movement =>
                    movement.Type ==
                    "OrderCancellation"
            );

        Assert.Equal(
            3,
            cancellationMovement.QuantityChange
        );

        Assert.Equal(
            cancelledOrder.Id,
            cancellationMovement.OrderId
        );
    }


    private static UnitOfWork CreateUnitOfWork(
        AppDbContext context)
    {
        return new UnitOfWork(
            context,
            new ClientRepository(context),
            new ProductRepository(context),
            new OrderRepository(context),
            new UserRepository(context),
            new SupplierRepository(context),
            new StockMovementRepository(context)
        );
    }
}