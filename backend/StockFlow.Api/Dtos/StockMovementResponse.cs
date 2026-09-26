namespace StockFlow.Api.Dtos;

public class StockMovementResponse
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    public string ProductName { get; set; } = string.Empty;

    public int? OrderId { get; set; }

    public int QuantityChange { get; set; }

    public string Type { get; set; } = string.Empty;

    public string Reason { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}