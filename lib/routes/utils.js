const { body, param, validationResult } = require('express-validator');

exports.ValidateListName = body('name', 'missing list name')
  .trim()
  .not()
  .isEmpty()
  .escape();

exports.ValidateListParam = param('lid', 'invalid list id')
  .isMongoId();

exports.ValidateItemParam = param('iid', 'invalid item id')
  .isMongoId();

exports.ValidateItemContent = body('content', 'missing item content')
  .trim()
  .not()
  .isEmpty()
  .escape();

exports.ValidateItemPatch = body('ok', 'missing patch data')
  .isBoolean();

exports.CheckValidationErr = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    next();
  } else {
    req.log.warn(errors);
    res.status(400).json({ errors: errors.array() });
  }
};

module.exports = exports;
