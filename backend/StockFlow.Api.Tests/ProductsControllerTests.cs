using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockFlow.Api.Controllers;
using StockFlow.Api.Data;
using StockFlow.Api.Dtos;
using StockFlow.Api.Models;
using StockFlow.Api.Repositories;

namespace StockFlow.Api.Tests;

public class ProductsControllerTests
{
    [Fact]
    public async Task AdjustStock_WithDifferentActualQuantity_UpdatesStockAndCreatesMovement()
    {
        var options =
            new DbContextOptionsBuilder<AppDbContext>()
                .UseSqlite("Filename=:memory:")
                .Options;

        await using var context =
            new AppDbContext(options);

        await context.Database.OpenConnectionAsync();
        await context.Database.EnsureCreatedAsync();


        var product = new Product
        {
            Name = "Souris sans fil",
            Reference = "SOURIS-001",
            Category = "Informatique",
            UnitPrice = 50m,
            StockQuantity = 15,
            MinimumStock = 3
        };

        context.Products.Add(product);

        await context.SaveChangesAsync();


        var unitOfWork =
            CreateUnitOfWork(context);

        var controller =
            new ProductsController(unitOfWork);


        var request =
            new AdjustStockRequest
            {
                ActualQuantity = 12,
                Reason = "Inventaire physique"
            };


        var result =
            await controller.AdjustStock(
                product.Id,
                request
            );


        var okResult =
            Assert.IsType<OkObjectResult>(
                result.Result
            );

        Assert.NotNull(
            okResult.Value
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
            12,
            updatedProduct.StockQuantity
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
            "Adjustment",
            movement.Type
        );

        Assert.Equal(
            "Inventaire physique",
            movement.Reason
        );

        Assert.Null(
            movement.OrderId
        );
    }


    [Fact]
    public async Task AdjustStock_WithSameQuantity_DoesNotCreateMovement()
    {
        var options =
            new DbContextOptionsBuilder<AppDbContext>()
                .UseSqlite("Filename=:memory:")
                .Options;

        await using var context =
            new AppDbContext(options);

        await context.Database.OpenConnectionAsync();
        await context.Database.EnsureCreatedAsync();


        var product = new Product
        {
            Name = "Souris sans fil",
            Reference = "SOURIS-001",
            Category = "Informatique",
            UnitPrice = 50m,
            StockQuantity = 15,
            MinimumStock = 3
        };

        context.Products.Add(product);

        await context.SaveChangesAsync();


        var unitOfWork =
            CreateUnitOfWork(context);

        var controller =
            new ProductsController(unitOfWork);


        var request =
            new AdjustStockRequest
            {
                ActualQuantity = 15,
                Reason = "Inventaire physique"
            };


        var result =
            await controller.AdjustStock(
                product.Id,
                request
            );


        var badRequest =
            Assert.IsType<BadRequestObjectResult>(
                result.Result
            );

        Assert.Equal(
            "Le stock réel est identique au stock enregistré. Aucun ajustement n'est nécessaire.",
            badRequest.Value
        );


        context.ChangeTracker.Clear();


        var unchangedProduct =
            await context.Products
                .SingleAsync();

        Assert.Equal(
            15,
            unchangedProduct.StockQuantity
        );

        Assert.Equal(
            0,
            await context.StockMovements
                .CountAsync()
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