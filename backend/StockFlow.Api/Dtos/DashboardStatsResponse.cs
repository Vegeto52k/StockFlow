namespace StockFlow.Api.Dtos;

public class DashboardStatsResponse
{
    public decimal Revenue { get; set; }

    public int OrderCount { get; set; }

    public int ClientCount { get; set; }

    public int LowStockProductCount { get; set; }
}