const passport = require('passport');
const GoogleStrategy = require('passport-google-oidc');

class GoogleAuth {
  #strategy;

  constructor(opts) {
    // need to do this once config object that is passed
    // does not form objects properly and it fails with
    // "TypeError: OpenIDConnectStrategy requires an issuer option"
    const params = { ...opts };
    this.#strategy = new GoogleStrategy(params, this.#verify);
  }

  setup(app) {
    passport.use(this.#strategy);
    passport.serializeUser(this.#serializeUser);
    passport.deserializeUser(this.#deserializeUser);

    app.get('/login/federated/accounts.google.com', passport.authenticate('google', { scope: ['profile'] }));
    app.get(
      '/oauth2/redirect/accounts.google.com',
      passport.authenticate('google', { failureRedirect: '/login/federated/accounts.google.com' }),
      (req, res) => res.redirect('/'),
    );
  }

  #verify(issuer, profile, done) {
    console.log('verify', this);
    done(null, profile);
  }

  #serializeUser(user, done) {
    console.log('serialize', this);
    done(null, { id: user.id, name: user.displayName });
  }

  #deserializeUser(user, done) {
    console.log('deserialize', this);
    done(null, user);
  }
}

module.exports = GoogleAuth;
