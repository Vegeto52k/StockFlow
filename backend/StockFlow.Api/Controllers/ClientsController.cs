using Microsoft.AspNetCore.Mvc;
using StockFlow.Api.Models;

namespace StockFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClientsController : ControllerBase
{
    private static readonly List<Client> Clients =
    [
        new Client
        {
            Id = 1,
            Name = "Martin Dupont",
            Email = "martin.dupont@email.fr",
            Phone = "06 12 34 56 78",
            City = "Marseille"
        },
        new Client
        {
            Id = 2,
            Name = "Sophie Bernard",
            Email = "sophie.bernard@email.fr",
            Phone = "06 98 76 54 32",
            City = "Aix-en-Provence"
        },
        new Client
        {
            Id = 3,
            Name = "Lucas Morel",
            Email = "lucas.morel@email.fr",
            Phone = "06 44 28 17 90",
            City = "Toulon"
        }
    ];

    [HttpGet]
    public ActionResult<IEnumerable<Client>> GetClients()
    {
        return Ok(Clients);
    }

    [HttpPost]
    public ActionResult<Client> CreateClient(Client client)
    {
        client.Id = Clients.Count == 0
            ? 1
            : Clients.Max(existingClient => existingClient.Id) + 1;

        Clients.Add(client);

        return Created(
            $"/api/clients/{client.Id}",
            client
        );
    }
}