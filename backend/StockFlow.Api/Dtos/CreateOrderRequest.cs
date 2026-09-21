namespace StockFlow.Api.Dtos;

public class CreateOrderRequest
{
    public int ClientId { get; set; }

    public List<CreateOrderItemRequest> Items { get; set; } = [];
}

public class CreateOrderItemRequest
{
    public int ProductId { get; set; }

    public int Quantity { get; set; }
}