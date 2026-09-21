namespace StockFlow.Api.Models;

public class Order
{
    public int Id { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string Status { get; set; } = "Pending";

    public int ClientId { get; set; }

    public Client? Client { get; set; }

    public List<OrderItem> Items { get; set; } = [];
}