module.exports = (req, res) => {
  console.log(req.user);
  console.log(req.csrfToken());
  console.log(req.isUnauthenticated());
  res.send('Hello World!');
};
