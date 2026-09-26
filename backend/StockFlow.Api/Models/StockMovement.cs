namespace StockFlow.Api.Models;

public class StockMovement
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    public Product? Product { get; set; }

    public int? OrderId { get; set; }

    public Order? Order { get; set; }

    public int QuantityChange { get; set; }

    public string Type { get; set; } = string.Empty;

    public string Reason { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}