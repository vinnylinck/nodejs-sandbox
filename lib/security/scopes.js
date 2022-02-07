const CheckScopes = (...required) => (req, res, next) => {
  const allowed = required.reduce((acc, scope) => acc && req.user.scopes.includes(scope));
  if (!allowed) {
    res.status(401).send('Missing permissions for such operation.');
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
