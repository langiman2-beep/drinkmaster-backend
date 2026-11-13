const { isValidObjectId } = require("mongoose");

const isValidId = (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: `${id} — кривой ID` });
  }
  next();
};

module.exports = isValidId;
