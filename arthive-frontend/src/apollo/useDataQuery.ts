import { useQuery } from "@apollo/client/react"
import type { DocumentNode } from "@apollo/client"
import type { TypedDocumentNode } from "@apollo/client"

// Apollo v4's `useQuery` return type is a discriminated union over four data
// states (empty / partial / streaming / complete). At consumer sites this
// surfaces as `data: TData | DeepPartial<TData> | undefined`, which forces
// every access — even `data?.foo.bar` — to be treated as possibly-undefined
// deep inside the chain.
//
// Every component in this app treats `data` as "the fully-fetched response or
// nothing", which is the complete/empty pair. This wrapper is a thin cast
// around `useQuery` that strips the partial + streaming variants from the
// return so `data` is just `TData | undefined`.
//
// It's not a lie: we don't use `@defer` or `returnPartialData`, so the
// partial/streaming branches never fire at runtime. The generic API remains
// identical to `useQuery`.
export function useDataQuery<
    TData = unknown,
    TVariables extends Record<string, unknown> = Record<string, unknown>,
>(
    query: DocumentNode | TypedDocumentNode<TData, TVariables>,
    // The overload set on `useQuery` is enormous; pass options through as-is.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: any,
) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = useQuery<TData, TVariables>(query, options as any)
    return result as unknown as {
        data: TData | undefined
        loading: boolean
        error: { message: string } | undefined
        fetchMore: typeof result.fetchMore
        refetch: typeof result.refetch
        networkStatus: typeof result.networkStatus
        client: typeof result.client
    }
}
