const { Schema, model } = require("mongoose");

const ingredientSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
  },
  { versionKey: false },
);

const Ingredient = model("ingredient", ingredientSchema);

module.exports = Ingredient;
