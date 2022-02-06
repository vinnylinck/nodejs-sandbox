module.exports = (req, res) => res.render(
  'welcome',
  {
    name: req.user.displayName,
    access: req.user.naccess || 0,
  },
);
