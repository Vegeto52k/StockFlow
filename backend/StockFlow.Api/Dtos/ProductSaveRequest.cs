namespace StockFlow.Api.Dtos;

public class ProductSaveRequest
{
    public string Name { get; set; } = string.Empty;

    public string Reference { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public decimal UnitPrice { get; set; }

    public int MinimumStock { get; set; }

    public int? SupplierId { get; set; }
}