module.exports = (req, res) => res.render(
  'tools-access-counter',
  {
    name: req.user.displayName,
    access: req.user.naccess || 0,
  },
);