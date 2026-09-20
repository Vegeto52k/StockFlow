using Microsoft.AspNetCore.Mvc;
using StockFlow.Api.Models;
using StockFlow.Api.Repositories;

namespace StockFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClientsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public ClientsController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Client>>> GetClients()
    {
        var clients = await _unitOfWork.Clients.GetAllAsync();

        return Ok(clients);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Client>> GetClientById(int id)
    {
        var client = await _unitOfWork.Clients.GetByIdAsync(id);

        if (client is null)
        {
            return NotFound();
        }

        return Ok(client);
    }

    [HttpPost]
    public async Task<ActionResult<Client>> CreateClient(Client client)
    {
        await _unitOfWork.Clients.AddAsync(client);

        await _unitOfWork.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetClientById),
            new { id = client.Id },
            client
        );
    }
}