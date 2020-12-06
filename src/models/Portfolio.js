const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PortfolioSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  stocks: [{ symbol: String, amount: Number }],
  cryptos: [{ symbol: String, amount: Number }],
  currencies: [{ symbol: String, amount: Number }],
});

module.exports = Portfolio = mongoose.model("portfolio", PortfolioSchema);
