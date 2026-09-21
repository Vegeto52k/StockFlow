namespace StockFlow.Api.Dtos;

public class OrderResponse
{
    public int Id { get; set; }

    public DateTime CreatedAt { get; set; }

    public string Status { get; set; } = string.Empty;

    public int ClientId { get; set; }

    public OrderClientResponse? Client { get; set; }

    public List<OrderItemResponse> Items { get; set; } = [];
}

public class OrderClientResponse
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;
}

public class OrderItemResponse
{
    public int Id { get; set; }

    public int OrderId { get; set; }

    public int ProductId { get; set; }

    public OrderProductResponse? Product { get; set; }

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }
}

public class OrderProductResponse
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Reference { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public decimal UnitPrice { get; set; }

    public int StockQuantity { get; set; }

    public int MinimumStock { get; set; }
}