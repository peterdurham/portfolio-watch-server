const {
  AuthenticationError,
  UserInputError,
} = require("apollo-server-express");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Portfolio = require("./models/Portfolio");
const jwt = require("jsonwebtoken");
const validateRegisterInput = require("./validation/register");
const validateLoginInput = require("./validation/login");

const getToken = ({ id, email }) =>
  jwt.sign(
    {
      id,
      email,
    },
    process.env.SECRET,
    { expiresIn: "1d" }
  );

module.exports = {
  Query: {
    getUser: async (_, args, ctx) => {
      const user = await User.findOne({ _id: ctx.user.id });

      return {
        id: user._id,
        username: user.username,
        email: user.email,
      };
    },
    portfolio: async (_, args, ctx) => {
      const portfolio = await Portfolio.findOne({ user: ctx.user.id });
      return portfolio;
    },
  },
  Mutation: {
    registerUser: async (_, { email, username, password }) => {
      const { errors, valid } = validateRegisterInput({ email, password });
      if (!valid) throw new UserInputError("Error", { errors });

      const user = await User.findOne({ email });
      if (user)
        throw new UserInputError("A user with this email already exists");

      password = await bcrypt.hash(password, 10);
      const newUser = new User({
        email,
        username,
        password,
      });

      const res = await newUser.save();
      const token = getToken(res);

      // Create Empty Portfolio for new user
      const newPortfolio = new Portfolio({
        user: res._id,
        stocks: [],
        cryptos: [],
        currencies: [],
      });
      const portfolioResponse = await newPortfolio.save();

      return { token };
    },
    registerGuest: async () => {
      const random = new Date().getTime();
      const randomString = random.toString();

      const newUser = new User({
        email: `guest${randomString}@test.com`,
        username: `guest-${randomString}`,
        password: randomString,
      });

      const res = await newUser.save();
      const token = getToken(res);

      // Create Empty Portfolio for new user
      const newPortfolio = new Portfolio({
        user: res._id,
        stocks: [],
        cryptos: [],
        currencies: [],
      });
      const portfolioResponse = await newPortfolio.save();

      return { token };
    },
    loginUser: async (_, { email, password }, ctx) => {
      const { errors, valid } = validateLoginInput({ email, password });

      if (!valid) throw new UserInputError("Error", { errors });

      const user = await User.findOne({ email });
      if (!user) throw new AuthenticationError("This user was not found");

      const match = await bcrypt.compare(password, user.password);
      if (!match) throw new AuthenticationError("Incorrect password");

      const token = getToken(user);

      return { token };
    },
    updateCurrency: async (_, { symbol, amount }, ctx) => {
      const portfolio = await Portfolio.findOne({ user: ctx.user.id });
      const currencies = [...portfolio.currencies];

      const alreadyAdded = currencies.filter(
        (currency) => currency.symbol === symbol
      );

      let updatedCurrencies;

      if (alreadyAdded.length === 0) {
        // New Currency
        updatedCurrencies = currencies.concat({ symbol, amount });
      } else {
        // Updating Currency
        updatedCurrencies = currencies.map((currency) => {
          if (currency.symbol === symbol) {
            return { symbol: symbol, amount: amount };
          }
          return currency;
        });
      }

      const updated = await Portfolio.findOneAndUpdate(
        { _id: portfolio._id },
        {
          $set: {
            currencies: updatedCurrencies,
          },
        },
        { new: true }
      );

      return updated;
    },
    updateStock: async (_, { symbol, amount }, ctx) => {
      const portfolio = await Portfolio.findOne({ user: ctx.user.id });
      const stocks = [...portfolio.stocks];

      const alreadyAdded = stocks.filter((stock) => stock.symbol === symbol);

      let updateStocks;

      if (alreadyAdded.length === 0) {
        // New Stock
        updateStocks = stocks.concat({ symbol, amount });
      } else {
        // Updating Stock
        updateStocks = stocks.map((stock) => {
          if (stock.symbol === symbol) {
            return { symbol: symbol, amount: amount };
          }
          return stock;
        });
      }

      const updated = await Portfolio.findOneAndUpdate(
        { _id: portfolio._id },
        {
          $set: {
            stocks: updateStocks,
          },
        },
        { new: true }
      );

      return updated;
    },
    updateCrypto: async (_, { symbol, amount }, ctx) => {
      const portfolio = await Portfolio.findOne({ user: ctx.user.id });
      const cryptos = [...portfolio.cryptos];

      const alreadyAdded = cryptos.filter((crypto) => crypto.symbol === symbol);

      let updateCryptos;

      if (alreadyAdded.length === 0) {
        // New Crypto
        updateCryptos = cryptos.concat({ symbol, amount });
      } else {
        // Updating Crypto
        updateCryptos = cryptos.map((crypto) => {
          if (crypto.symbol === symbol) {
            return { symbol: symbol, amount: amount };
          }
          return crypto;
        });
      }

      const updated = await Portfolio.findOneAndUpdate(
        { _id: portfolio._id },
        {
          $set: {
            cryptos: updateCryptos,
          },
        },
        { new: true }
      );

      return updated;
    },
  },
};
