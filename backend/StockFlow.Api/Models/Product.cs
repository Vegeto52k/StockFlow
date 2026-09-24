namespace StockFlow.Api.Models;

public class Product
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Reference { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public decimal UnitPrice { get; set; }

    public int StockQuantity { get; set; }

    public int MinimumStock { get; set; }

    public int? SupplierId { get; set; }

    public Supplier? Supplier { get; set; }
}