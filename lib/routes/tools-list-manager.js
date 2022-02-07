module.exports = (req, res) => res.render(
  'tools-list-manager',
  {
    name: req.user.displayName,
    access: req.user.naccess || 0,
  },
);
