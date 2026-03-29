import { ApolloClient } from "@apollo/client/core";
import { InMemoryCache } from "@apollo/client/cache";
import { ApolloLink } from "@apollo/client/link";
import { HttpLink } from "@apollo/client/link/http";

// this occurs before every graphql request

const httpLink = new HttpLink({uri: "http://localhost:3000/graphql"});

// auth middleware
const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('authToken');
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,                // keep existing headers
      ...(token? {Authorization: `Bearer ${token}`} : {}),
      "Content-Type": "application/json",
    },
  }));
  return forward(operation);
});

const link = ApolloLink.from([authLink, httpLink]);

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
