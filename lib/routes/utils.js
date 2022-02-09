const { body, param, validationResult } = require('express-validator');

exports.ValidateListName = body('name', 'missing list name')
  .not()
  .isEmpty()
  .trim()
  .escape();

exports.ValidateListParam = param('lid', 'invalid list id')
  .not()
  .isEmpty()
  .isMongoId();

exports.ValidateItemParam = param('iid', 'invalid item id')
  .not()
  .isEmpty()
  .isMongoId();

exports.ValidateItemContent = body('content', 'missing item content')
  .not()
  .isEmpty()
  .trim()
  .escape();

exports.CheckValidationErr = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    next();
  } else {
    res.status(400).json({ errors: errors.array() });
  }
};

module.exports = exports;
