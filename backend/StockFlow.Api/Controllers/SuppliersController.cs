using Microsoft.AspNetCore.Mvc;
using StockFlow.Api.Models;
using StockFlow.Api.Repositories;

namespace StockFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SuppliersController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public SuppliersController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Supplier>>> GetSuppliers()
    {
        var suppliers =
            await _unitOfWork.Suppliers.GetAllAsync();

        return Ok(suppliers);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Supplier>> GetSupplierById(
        int id)
    {
        var supplier =
            await _unitOfWork.Suppliers.GetByIdAsync(id);

        if (supplier is null)
        {
            return NotFound();
        }

        return Ok(supplier);
    }

    [HttpPost]
    public async Task<ActionResult<Supplier>> CreateSupplier(
        Supplier supplier)
    {
        await _unitOfWork.Suppliers.AddAsync(
            supplier
        );

        await _unitOfWork.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetSupplierById),
            new { id = supplier.Id },
            supplier
        );
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateSupplier(
        int id,
        Supplier supplier)
    {
        if (id != supplier.Id)
        {
            return BadRequest();
        }

        var existingSupplier =
            await _unitOfWork.Suppliers.GetByIdAsync(id);

        if (existingSupplier is null)
        {
            return NotFound();
        }

        _unitOfWork.Suppliers.Update(
            supplier
        );

        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteSupplier(
        int id)
    {
        var supplier =
            await _unitOfWork.Suppliers.GetByIdAsync(id);

        if (supplier is null)
        {
            return NotFound();
        }

        var hasProducts =
            await _unitOfWork.Products
                .ExistsForSupplierAsync(id);

        if (hasProducts)
        {
            return Conflict(
                "Ce fournisseur est associé à un ou plusieurs produits et ne peut pas être supprimé."
            );
        }

        _unitOfWork.Suppliers.Delete(
            supplier
        );

        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }
}