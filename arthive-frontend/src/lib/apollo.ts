import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";

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
