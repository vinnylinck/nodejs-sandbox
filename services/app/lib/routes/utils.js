const Promise = require('bluebird');
const {
  body,
  param,
  query,
  validationResult,
} = require('express-validator');
const { models } = require('njs-sandbox-commons/db');

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

exports.ValidateStreamParams = [
  query('_csrf').not().isEmpty(),
  query('apikey').not().isEmpty(),
];

exports.CheckValidationErr = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    next();
  } else {
    req.log.warn(errors);
    res.status(400).json({ errors: errors.array() });
  }
};

exports.Wipe = (owner) => Promise
  .resolve(models().Lists.find({ owner }))
  .then((lists) => {
    const listIds = [];
    let itemIds = [];

    if (!lists || !lists.length) {
      return { listIds, itemIds };
    }

    lists.forEach((l) => {
      listIds.push(l.id);
      itemIds = [...itemIds, ...l.items];
    });

    return { listIds, itemIds };
  })
  .then((targets) => Promise.all([
    models().Lists.deleteMany({ _id: { $in: targets.listIds } }),
    models().Items.deleteMany({ _id: { $in: targets.itemIds } }),
  ]));

module.exports = exports;
