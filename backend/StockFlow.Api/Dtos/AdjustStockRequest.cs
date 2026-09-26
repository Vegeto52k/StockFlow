namespace StockFlow.Api.Dtos;

public class AdjustStockRequest
{
    public int ActualQuantity { get; set; }

    public string Reason { get; set; } = string.Empty;
}