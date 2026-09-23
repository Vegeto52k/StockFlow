using StockFlow.Api.Models;

namespace StockFlow.Api.Services;

public interface ITokenService
{
    string CreateToken(User user);
}