const express = require("express");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

app.listen("3000", () => {
  console.log("listening");
});
