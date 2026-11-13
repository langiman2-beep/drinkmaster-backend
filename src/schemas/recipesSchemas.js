const Joi = require("joi");

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
  ingredients: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().required(),
        measure: Joi.string().required(),
        ingredientId: Joi.string().optional(),
      }),
    )
    .optional(),
});

module.exports = {
  addRecipeSchema,
};
