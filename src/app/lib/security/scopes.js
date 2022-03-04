const CheckScopes = (...required) => (req, res, next) => {
  const missing = [];
  let allowed = true;

  // checking all permissions against scope. If one fails, stop.
  for (let i = 0; i < required.length; i += 1) {
    if (!req.user.scopes.includes(required[i])) {
      allowed = false;
      missing.push(required[i]);
      break;
    }
  }

  if (!allowed) {
    req.log.warn(`no access rights; missing=${missing}; user-scopes=${req.user.scopes};`);
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
    ITEM_WRITE: 'item.write',
    EVENT_READ: 'event.read',
  },
};
