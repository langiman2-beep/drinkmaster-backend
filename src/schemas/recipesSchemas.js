const Joi = require("joi");

const ingredientItem = Joi.object({
  title: Joi.string().required(),
  measure: Joi.string().required(),
  ingredientId: Joi.string().allow("", null).optional(),
});

const addRecipeSchema = Joi.object({
  drink: Joi.string().required().messages({
    "any.required": "Missing required drink name field",
  }),
  category: Joi.string().required(),
  alcoholic: Joi.string().valid("Alcoholic", "Non alcoholic").required(),
  glass: Joi.string().required(),
  description: Joi.string().allow("").optional(),
  instructions: Joi.string().required(),
  drinkThumb: Joi.string().allow("").optional(),
  ingredients: Joi.alternatives()
    .try(Joi.array().items(ingredientItem), Joi.string())
    .optional(),
});

module.exports = {
  addRecipeSchema,
};
