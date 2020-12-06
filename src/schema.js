const { gql } = require("apollo-server-express");

module.exports = gql`
  type User {
    id: ID!
    username: String
    email: String
  }

  type Token {
    token: String!
  }

  type Portfolio {
    user: ID!
    stocks: [Asset]
    cryptos: [Asset]
    currencies: [Asset]
  }

  type Asset {
    symbol: String!
    amount: Float!
  }

  type Query {
    getUser: User
    portfolio: Portfolio
  }

  type Mutation {
    registerUser(email: String, username: String, password: String): Token!
    registerGuest: Token!
    loginUser(email: String, password: String): Token!
    updateCurrency(symbol: String, amount: Float): Portfolio
    updateStock(symbol: String, amount: Float): Portfolio
    updateCrypto(symbol: String, amount: Float): Portfolio
  }
`;
