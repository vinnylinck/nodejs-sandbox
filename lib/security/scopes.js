const CheckScopes = (...required) => (req, res, next) => {
  let allowed = true;

  // checking all permisions against scope. If one fails, stop.
  for (let i = 0; i < required.length; i += 1) {
    if (!req.user.scopes.includes(required[i])) {
      allowed = false;
      break;
    }
  }

  if (!allowed) {
    res.status(403).send('no access rights');
  } else {
    next();
  }
};

module.exports = {
  CheckScopes,
  list: {
    LIST_READ: 'list.read',
    LIST_WRITE: 'list.write',
    ITEM_READ: 'item.read',
  },
};
