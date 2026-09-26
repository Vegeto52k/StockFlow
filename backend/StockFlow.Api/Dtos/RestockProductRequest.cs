namespace StockFlow.Api.Dtos;

public class RestockProductRequest
{
    public int Quantity { get; set; }

    public string Reason { get; set; } = string.Empty;
}