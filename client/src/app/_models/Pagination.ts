export interface Pagination{
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export class PaginationResult<T>{
    result!: T;
    pagination!: Pagination;
}
