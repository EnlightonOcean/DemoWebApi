namespace API.Helpers
{
    public class PaginationHeader
    {
        public PaginationHeader(int currentPage, int pageSize, int totalItems, int totalPages)
        {
            CurrentPage = currentPage;
            PageSize = pageSize;
            TotalItems = totalItems;
            TotalPages = totalPages;
        }

        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
        public int TotalItems { get; set; }
        public int TotalPages { get; set; }
        
    }
}