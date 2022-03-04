const assert = require('assert');
const config = require('config');
const yaml = require('js-yaml');
const fs = require('fs');

const kv = [
  { key: 'is_test', type: 'boolean', value: true },
  { key: 'app', type: 'object' },
  { key: 'app.port', type: 'number' },
  { key: 'app.logging', type: 'object' },
  { key: 'app.logging.level', type: 'string', value: 'error' },
  { key: 'app.templating', type: 'object' },
  { key: 'app.templating.autoescape', type: 'boolean', value: true },
  { key: 'app.templating.throwOnUndefined', type: 'boolean', value: true },
  { key: 'app.templating.watch', type: 'boolean', value: true },
  { key: 'app.templating.noCache', type: 'boolean', value: true },
  { key: 'db', type: 'object' },
  { key: 'db.url', type: 'string' },
  { key: 'security', type: 'object' },
  { key: 'security.paseto', type: 'object' },
  { key: 'security.paseto.privateKey', type: 'string' },
  { key: 'security.session', type: 'object' },
  { key: 'security.session.secret', type: 'string' },
  { key: 'security.session.resave', type: 'boolean', value: false },
  { key: 'security.session.saveUninitialized', type: 'boolean', value: false },
  { key: 'security.cookie', type: 'object' },
  { key: 'security.cookie.secret', type: 'string' },
  { key: 'security.cookie.options', type: 'object' },
  { key: 'security.cookie.options.secure', type: 'boolean', value: false },
  { key: 'security.google', type: 'object' },
  { key: 'security.google.clientID', type: 'string' },
  { key: 'security.google.clientSecret', type: 'string' },
  { key: 'security.google.callbackURL', type: 'string' },
  { key: 'security.google.scope', type: 'object', contains: 'profile' },
];

describe('AppConfig', function () {
  // testing basic config structure
  describe('structure', function () {
    for (const prop of kv) {
      // check property
      it(`should have entry <${prop.key}>`, function () {
        assert.ok(config.has(prop.key));
      });

      // interrupt if has no prop
      if (!config.has(prop.key)) {
        continue;
      }

      // test prop type
      const actual = config.get(prop.key);

      it(`should have entry <${prop.key}> of type <${prop.type}>`, function () {
        assert.equal(typeof actual, prop.type);
      });

      // test values when it make sense
      if (!!Object.getOwnPropertyDescriptor(prop, 'value')) {
        it(`should have entry <${prop.key}> with value <${prop.value}>`, function () {
          assert.equal(actual, prop.value);
        });
      }
    }
  });

  // testing basic production settings
  describe('production', function () {
    const fc = fs.readFileSync('./config/production.yml', 'utf8');
    const data = yaml.load(fc);

    // checking app.logging.level
    it('should have logging level set as INFO', function () {
      assert.ok(!!data && data.app && data.app.logging && data.app.logging.level);
      assert.equal(data.app.logging.level, 'info');
    });

    // checking security.google.callbackURL
    it('should have google callbackURL pointing to Heroku app', function () {
      assert.ok(
        !!data && data.security
        && data.security.google
        && data.security.google.callbackURL,
      );

      assert.equal(data.security.google.callbackURL, 'https://njs-sandbox.herokuapp.com/oauth2/redirect/accounts.google.com');
    });
  });
});
