const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../helpers");

const recipeSchema = new Schema(
  {
    drink: {
      type: String,
      required: [true, "Set name for drink"],
    },
    category: {
      type: String,
      required: true,
    },
    alcoholic: {
      type: String,
      required: true,
    },
    glass: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    instructions: {
      type: String,
      required: true,
    },
    drinkThumb: {
      type: String,
    },
    ingredients: [
      {
        title: String,
        measure: String,
        ingredientId: {
          type: Schema.Types.ObjectId,
          ref: "ingredient",
        },
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    favorite: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  { versionKey: false, timestamps: true },
);

// recipeSchema.post("save", handleMongooseError);

const Recipe = model("recipe", recipeSchema);

module.exports = Recipe;
