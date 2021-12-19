using System.Text.Json;
using API.Helpers;

namespace API.Extensions
{
    public static class HttpExtensions
    {
        public static void AddPaginationHeader(this HttpResponse response, int currentPage, int pageSize,
         int totalItems,int totalPages){
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            response.Headers.Add("Pagination",JsonSerializer.Serialize(new PaginationHeader(currentPage,pageSize,totalItems,totalPages),options));
            response.Headers.Add("Access-Control-Expose-Headers","Pagination");
        }
    }
}