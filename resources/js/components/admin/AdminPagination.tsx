import { router } from '@inertiajs/react';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import type { PaginatedData } from '@/types';

type PaginationQuery = Record<string, string | number | null | undefined>;

type AdminPaginationProps = {
    paginated: PaginatedData<unknown>;
    route: string;
    pageParam: string;
    itemLabel: string;
    query?: PaginationQuery;
};

function buildPageItems(currentPage: number, lastPage: number) {
    if (lastPage <= 7) {
        return Array.from({ length: lastPage }, (_, index) => index + 1);
    }

    const pages: Array<number | 'ellipsis'> = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(lastPage - 1, currentPage + 1);

    if (start > 2) {
        pages.push('ellipsis');
    }

    for (let page = start; page <= end; page += 1) {
        pages.push(page);
    }

    if (end < lastPage - 1) {
        pages.push('ellipsis');
    }

    pages.push(lastPage);

    return pages;
}

export default function AdminPagination({
    paginated,
    route,
    pageParam,
    itemLabel,
    query = {},
}: AdminPaginationProps) {
    if (paginated.last_page <= 1) {
        return (
            <p className="text-xs text-gray-500">
                Showing {paginated.total === 0 ? 0 : paginated.from ?? 0} to {paginated.to ?? 0} of {paginated.total}{' '}
                {itemLabel}
            </p>
        );
    }

    const goToPage = (page: number) => {
        if (page < 1 || page > paginated.last_page || page === paginated.current_page) {
            return;
        }

        const nextQuery: PaginationQuery = {
            ...query,
            [pageParam]: page,
        };

        const cleanedQuery = Object.fromEntries(
            Object.entries(nextQuery).filter(([, value]) => value !== undefined && value !== null && value !== ''),
        );

        router.get(route, cleanedQuery, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const pageItems = buildPageItems(paginated.current_page, paginated.last_page);
    const canGoPrevious = paginated.current_page > 1;
    const canGoNext = paginated.current_page < paginated.last_page;

    return (
        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">
                Showing {paginated.total === 0 ? 0 : paginated.from ?? 0} to {paginated.to ?? 0} of {paginated.total}{' '}
                {itemLabel}
            </p>

            <Pagination className="mx-0 w-auto justify-start sm:justify-end">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            aria-disabled={!canGoPrevious}
                            className={!canGoPrevious ? 'pointer-events-none opacity-50' : undefined}
                            onClick={(event) => {
                                event.preventDefault();
                                goToPage(paginated.current_page - 1);
                            }}
                        />
                    </PaginationItem>

                    {pageItems.map((item, index) => (
                        <PaginationItem key={`${item}-${index}`}>
                            {item === 'ellipsis' ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    href="#"
                                    isActive={item === paginated.current_page}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        goToPage(item);
                                    }}
                                >
                                    {item}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            aria-disabled={!canGoNext}
                            className={!canGoNext ? 'pointer-events-none opacity-50' : undefined}
                            onClick={(event) => {
                                event.preventDefault();
                                goToPage(paginated.current_page + 1);
                            }}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
