using Microsoft.AspNetCore.Mvc;
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
        var products = await _unitOfWork.Products.GetAllAsync();

        return Ok(products);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> GetProductById(int id)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id);

        if (product is null)
        {
            return NotFound();
        }

        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        await _unitOfWork.Products.AddAsync(product);

        await _unitOfWork.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetProductById),
            new { id = product.Id },
            product
        );
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<Product>> UpdateProduct(
        int id,
        Product updatedProduct)
    {
        var existingProduct =
            await _unitOfWork.Products.GetByIdAsync(id);

        if (existingProduct is null)
        {
            return NotFound();
        }

        existingProduct.Name = updatedProduct.Name;
        existingProduct.Reference = updatedProduct.Reference;
        existingProduct.Category = updatedProduct.Category;
        existingProduct.UnitPrice = updatedProduct.UnitPrice;
        existingProduct.StockQuantity = updatedProduct.StockQuantity;
        existingProduct.MinimumStock = updatedProduct.MinimumStock;

        _unitOfWork.Products.Update(existingProduct);

        await _unitOfWork.SaveChangesAsync();

        return Ok(existingProduct);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id);

        if (product is null)
        {
            return NotFound();
        }

        _unitOfWork.Products.Delete(product);

        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }
}