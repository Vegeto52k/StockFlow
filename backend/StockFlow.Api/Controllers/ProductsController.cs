using Microsoft.AspNetCore.Mvc;
using StockFlow.Api.Dtos;
using StockFlow.Api.Models;
using StockFlow.Api.Repositories;

namespace StockFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public ProductsController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
    {
        var products =
            await _unitOfWork.Products.GetAllAsync();

        return Ok(products);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> GetProductById(
        int id)
    {
        var product =
            await _unitOfWork.Products.GetByIdAsync(id);

        if (product is null)
        {
            return NotFound();
        }

        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(
        ProductSaveRequest request)
    {
        if (request.SupplierId is not null)
        {
            var supplier =
                await _unitOfWork.Suppliers.GetByIdAsync(
                    request.SupplierId.Value
                );

            if (supplier is null)
            {
                return BadRequest(
                    "Le fournisseur sélectionné n'existe pas."
                );
            }
        }

        var product = new Product
        {
            Name = request.Name,
            Reference = request.Reference,
            Category = request.Category,
            UnitPrice = request.UnitPrice,
            MinimumStock = request.MinimumStock,
            SupplierId = request.SupplierId,
            StockQuantity = 0
        };

        await _unitOfWork.Products.AddAsync(
            product
        );

        await _unitOfWork.SaveChangesAsync();

        var createdProduct =
            await _unitOfWork.Products.GetByIdAsync(
                product.Id
            );

        return CreatedAtAction(
            nameof(GetProductById),
            new { id = product.Id },
            createdProduct
        );
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateProduct(
        int id,
        ProductSaveRequest request)
    {
        var product =
            await _unitOfWork.Products
                .GetByIdForUpdateAsync(id);

        if (product is null)
        {
            return NotFound();
        }

        if (request.SupplierId is not null)
        {
            var supplier =
                await _unitOfWork.Suppliers.GetByIdAsync(
                    request.SupplierId.Value
                );

            if (supplier is null)
            {
                return BadRequest(
                    "Le fournisseur sélectionné n'existe pas."
                );
            }
        }

        product.Name =
            request.Name;

        product.Reference =
            request.Reference;

        product.Category =
            request.Category;

        product.UnitPrice =
            request.UnitPrice;

        product.MinimumStock =
            request.MinimumStock;

        product.SupplierId =
            request.SupplierId;

        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id:int}/restock")]
    public async Task<ActionResult<Product>> RestockProduct(
        int id,
        RestockProductRequest request)
    {
        if (request.Quantity <= 0)
        {
            return BadRequest(
                "La quantité de réapprovisionnement doit être supérieure à zéro."
            );
        }

        var product =
            await _unitOfWork.Products
                .GetByIdForUpdateAsync(id);

        if (product is null)
        {
            return NotFound(
                "Le produit demandé n'existe pas."
            );
        }

        var reason =
            string.IsNullOrWhiteSpace(request.Reason)
                ? "Réapprovisionnement"
                : request.Reason.Trim();

        product.StockQuantity +=
            request.Quantity;

        await _unitOfWork.StockMovements.AddAsync(
            new StockMovement
            {
                ProductId = product.Id,

                QuantityChange =
                    request.Quantity,

                Type = "Restock",

                Reason = reason,

                CreatedAt =
                    DateTime.UtcNow
            }
        );

        await _unitOfWork.SaveChangesAsync();

        var updatedProduct =
            await _unitOfWork.Products.GetByIdAsync(
                id
            );

        if (updatedProduct is null)
        {
            return StatusCode(500);
        }

        return Ok(updatedProduct);
    }

    [HttpPost("{id:int}/adjust-stock")]
    public async Task<ActionResult<Product>> AdjustStock(
        int id,
        AdjustStockRequest request)
    {
        if (request.ActualQuantity < 0)
        {
            return BadRequest(
                "Le stock réel ne peut pas être négatif."
            );
        }

        var product =
            await _unitOfWork.Products
                .GetByIdForUpdateAsync(id);

        if (product is null)
        {
            return NotFound(
                "Le produit demandé n'existe pas."
            );
        }

        var quantityChange =
            request.ActualQuantity -
            product.StockQuantity;

        if (quantityChange == 0)
        {
            return BadRequest(
                "Le stock réel est identique au stock enregistré. Aucun ajustement n'est nécessaire."
            );
        }

        var reason =
            string.IsNullOrWhiteSpace(request.Reason)
                ? "Correction d'inventaire"
                : request.Reason.Trim();

        product.StockQuantity =
            request.ActualQuantity;

        await _unitOfWork.StockMovements.AddAsync(
            new StockMovement
            {
                ProductId = product.Id,

                QuantityChange =
                    quantityChange,

                Type = "Adjustment",

                Reason = reason,

                CreatedAt =
                    DateTime.UtcNow
            }
        );

        await _unitOfWork.SaveChangesAsync();

        var updatedProduct =
            await _unitOfWork.Products.GetByIdAsync(
                id
            );

        if (updatedProduct is null)
        {
            return StatusCode(500);
        }

        return Ok(updatedProduct);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProduct(
        int id)
    {
        var product =
            await _unitOfWork.Products.GetByIdAsync(id);

        if (product is null)
        {
            return NotFound();
        }

        _unitOfWork.Products.Delete(product);

        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }
}