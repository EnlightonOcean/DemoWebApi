import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginationResult } from 'src/app/_models/Pagination';

export function getPaginatedResult<T>(url: string, params: HttpParams, http: HttpClient): Observable<PaginationResult<T>> {
        const paginatedResult: PaginationResult<T> = new PaginationResult<T>();
        return http.get<T>(url,
            { observe: 'response', params })
            .pipe(
                map(response => {
                    if (response.body) {
                        paginatedResult.result = response.body;
                    }
                    if (response.headers.get('Pagination')) {
                        paginatedResult.pagination = JSON.parse(response.headers.get('Pagination') ?? '{ }');
                    }
                    return paginatedResult;
                })
            );
    }

export function getParams(pageNumber: number, pageSize: number): HttpParams {
        let params = new HttpParams();
        params = params.append('PageNumber', pageNumber.toString());
        params = params.append('PageSize', pageSize.toString());
        return params;
    }

