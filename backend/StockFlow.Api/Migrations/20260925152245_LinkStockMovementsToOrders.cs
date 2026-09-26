using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StockFlow.Api.Migrations
{
    /// <inheritdoc />
    public partial class LinkStockMovementsToOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "OrderId",
                table: "StockMovements",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_OrderId",
                table: "StockMovements",
                column: "OrderId");

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovements_Orders_OrderId",
                table: "StockMovements",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StockMovements_Orders_OrderId",
                table: "StockMovements");

            migrationBuilder.DropIndex(
                name: "IX_StockMovements_OrderId",
                table: "StockMovements");

            migrationBuilder.DropColumn(
                name: "OrderId",
                table: "StockMovements");
        }
    }
}
