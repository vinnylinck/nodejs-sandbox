const passport = require('passport');
const GoogleStrategy = require('passport-google-oidc');
const { ensureLoggedIn } = require('connect-ensure-login');

class GoogleAuth {
  #strategy;

  #loginURI;

  #federatedCredentials;

  #log;

  constructor(model, opts, logger) {
    // need to do this once config object that is passed
    // does not form objects properly, and it fails with
    // "TypeError: OpenIDConnectStrategy requires an issuer option"
    const params = { ...opts };

    this.#log = logger.child({ component: this.constructor.name });
    this.#federatedCredentials = model;
    this.#strategy = new GoogleStrategy(params, this.#verify.bind(this));
    this.#loginURI = '/login/federated/accounts.google.com';
  }

  setup(app) {
    passport.use(this.#strategy);
    passport.serializeUser(this.#serializeUser.bind(this));
    passport.deserializeUser(this.#deserializeUser.bind(this));

    app.get(this.#loginURI, passport.authenticate('google', { scope: ['profile', 'email'] }));
    app.get(
      '/oauth2/redirect/accounts.google.com',
      passport.authenticate('google', { failureRedirect: this.#loginURI }),
      (req, res) => res.redirect('/'),
    );

    return ensureLoggedIn({ redirectTo: this.#loginURI });
  }

  async #verify(issuer, profile, done) {
    this.#log.debug(`Verifying OpenID identity: id=${profile.id}`);
    this.#log.debug('Issuer: ', issuer);
    this.#log.trace('Profile:', profile);

    let fc = await this.#federatedCredentials.findOne({
      provider: issuer,
      profileId: profile.id,
    }).exec();

    if (!fc) {
      // The account at Google has not logged in to this app before.  Create a
      // new record and associate it with the Google account.
      fc = await this.#federatedCredentials.create({
        provider: issuer,
        profileId: profile.id,
        displayName: profile.displayName,
        profileName: profile.name,
        emails: profile.emails,
      });

      this.#log.debug('New federated credential:', fc.id);
    } else {
      fc.naccess = (fc.naccess || 0) + 1;
      fc.displayName = profile.displayName;
      fc.profileName = profile.name;
      fc.markModified('profileName');

      await this.#federatedCredentials.updateOne(
        { provider: fc.provider, profileId: fc.profileId },
        fc,
      );

      this.#log.trace('User access #: ', fc.naccess);
    }

    // done
    done(null, fc);
  }

  #serializeUser({ id, displayName: name }, done) {
    this.#log.trace('serializeUser:', id);
    done(null, { id, name });
  }

  #deserializeUser(user, done) {
    this.#log.trace('deserializeUser:', user);
    this.#federatedCredentials.findById(user.id, done);
  }
}

module.exports = GoogleAuth;
