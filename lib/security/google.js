const passport = require('passport');
const GoogleStrategy = require('passport-google-oidc');
const { ensureLoggedIn } = require('connect-ensure-login');

class GoogleAuth {
  #strategy;

  #loginURI;

  constructor(opts) {
    // need to do this once config object that is passed
    // does not form objects properly and it fails with
    // "TypeError: OpenIDConnectStrategy requires an issuer option"
    const params = { ...opts };

    this.#strategy = new GoogleStrategy(params, this.#verify);
    this.#loginURI = '/login/federated/accounts.google.com';
  }

  setup(app) {
    passport.use(this.#strategy);
    passport.serializeUser(this.#serializeUser);
    passport.deserializeUser(this.#deserializeUser);

    app.get(this.#loginURI, passport.authenticate('google', { scope: ['profile'] }));
    app.get(
      '/oauth2/redirect/accounts.google.com',
      passport.authenticate('google', { failureRedirect: this.#loginURI }),
      (req, res) => res.redirect('/'),
    );

    return ensureLoggedIn({ redirectTo: this.#loginURI });
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
    done(null, this, user);
  }
}

module.exports = GoogleAuth;
