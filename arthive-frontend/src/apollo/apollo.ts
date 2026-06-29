import { ApolloClient } from "@apollo/client/core"
import { InMemoryCache } from "@apollo/client/cache"
import { HttpLink } from "@apollo/client/link/http"
import { from } from "@apollo/client/link"
import { ErrorLink } from "@apollo/client/link/error"
import { CombinedGraphQLErrors } from "@apollo/client/errors"
import { Observable } from "rxjs"
import { REFRESH_SESSION_MUTATION } from "@/apollo/mutations/user_mutations"

// Auth lives in the httpOnly `authToken` cookie set by the backend login mutation.
// `credentials: "include"` opts cross-origin fetches into sending that cookie.
const httpLink = new HttpLink({
  uri: `${import.meta.env.VITE_API_URL}/graphql`,
  credentials: "include",
})

// Single-flight: multiple queries on the same page can all hit EXPIRED_TOKEN
// at once. We want ONE refresh call shared across them, not N parallel calls
// (which would race and break rotation).
let pendingRefresh: Promise<boolean> | null = null

const errorLink = new ErrorLink(({ error, operation, forward }) => {
  // In v4 the callback receives a unified `error` (not split into
  // graphQLErrors / networkError). For GraphQL errors it's a
  // CombinedGraphQLErrors instance carrying an `errors` array.
  if (!CombinedGraphQLErrors.is(error)) return
  if (!error.errors.some(e => e.message === "EXPIRED_TOKEN")) return

  // Don't intercept the refresh call itself - would infinite-loop.
  if (operation.operationName === "RefreshSession") return

  if (!pendingRefresh) {
    pendingRefresh = client
      .mutate({ mutation: REFRESH_SESSION_MUTATION })
      .then(() => true)
      .catch(() => false)
      .finally(() => { pendingRefresh = null })
  }

  return new Observable(observer => {
    let sub: { unsubscribe: () => void } | undefined
    pendingRefresh!.then(ok => {
      if (!ok) {
        observer.error(new Error("EXPIRED_TOKEN"))
        return
      }
      sub = forward(operation).subscribe({
        next: v => observer.next(v),
        error: err => observer.error(err),
        complete: () => observer.complete(),
      })
    })
    return () => { sub?.unsubscribe() }
  })
})

export const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
})
