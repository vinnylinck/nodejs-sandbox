# nodejs-sandbox
A playground project for Node.JS (where I play with a few features).
You can visit http://njs-sandbox.herokuapp.com/ for playing with the app.

## Requirements to run
* docker installed;
* NODE and NPM (please check versions on `package.json`);
* Configure your Google OAuth 2.0 to point to your app (please visit: https://www.passportjs.org/packages/passport-google-oidc/)

## Running on local
After cloning, just run:
```bash
npm install
docker compose up -d
npm start
```

### About Google Cloud Configuration

After understanding how Passport OpenID Connect works with Google OAuth, you need to make sure:
1. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables with the secrets to get access to Google API (you can also create a file called `local.yml` inside `config` folder and overwrite google credentials - please check `default.yml` as a reference about the format);

2. Make sure your Google OAuth Client ID authorized the following url: `http://localhost:5000/oauth2/redirect/accounts.google.com`. You can also point to another host with a deployed app running;


## Features

The goal of the app is purely focused on backend stuff. That means you should not expect a fancy UI.
The mainpage will list a few tools (mini-apps) to perform some dumb operations, like:

### Access management

This page is quite simple. It displays the user/session info as allows a few things:
* enable / disable scopes (permissions);
* delete other sessions (keeping only the one you are using to access the app);
* wipe out entire user data (session and OAuth records) from database;

Every user will start with `LIST_READ` and `ITEM_READ` scopes. You are good to add more permissions if you like it. Everytime you have a scope missing for a single operation, you will get a message like `no access rights` or `forbidden`.

I created this tool with the goal to play with:
* Google OAuth 2.0 APIs;
* Passport.JS;
* CSRF;
* Mongo Session Store;

### Manage Lists

This is pretty much a CRUD tool for managing `LISTS` and `ITEMS` (inside those lists). The big goal of this was play around with:
* Mongoose Schemas;
* Express-Validator;
* Promises with Bluebird;

### Event Listener

Back in time, I'd like to play with Mongo Oplog, but I never thought that "production ready" for building things on top of it (even knowing that I already sustained an app for years doing that). When Mongo launched `watch streams` I started to implement that and really enjoy how stable that is. The tricky thing that I was never a fan of Mongoose, because I always thought a bit weird define schemas for "schemaless" databases.

So, this tool was an opportunity to play with `Mongoose Watch` features and you should use like this:
* go the page;
* click on `listen events` button;
* drag the new window (opened by the tool) to some spot in your screen - it should keel loading a blank screen. It's not frozen. It is just like that;
* in the first window, navigate to the main page and start to play with Lists and Items;
* The database events should be displayed in the event window;

The cool thing about that is you can watch operations being performed by other users.
__Note:__ you will need all `READ` permissions to listen events.

## Security, PASETO and API Access Key

When using the `Event Listener` you mai notice the screen displays a "readonly" `API ACCESS KEY` input that is posted to the backend. That is not useful in a productive scenario, but was the place where I could make fit the opportunity to play with `PASETO`.

As you may know (and if you don't now you do) `JWT` is doomed by many reasons (mostly, security). That doesn't mean it is completely flaky, but it requires a bunch of extra work to make it secure (or more secure) than most of the cases and still, it may have a few breaches.

That is where I started to look for alternatives and I found `PASETO` (https://paseto.io/). This new standard is growing (at the time I wrote this) and I used to encrypt the some data that makes the API access token valid only for the current session, in a way you just can't steal and use in another browser (even if you copy the csrf token and post it with the api key).

The goal again wasn't to make the app more secure or do any work around security, but just get familiar with PASETO, the concepts and how to use the library in Node.JS;

# Some technical decisions I've made

Here goes some notes about the choices regarding this project goal:

## Express vs Hapi
Even that I like a lot `Hapi.JS` (https://github.com/hapijs) I haven't been playing with `Express` (http://expressjs.com/) for a while. So I took this as an opportunity to use it againg, but you will notice: __the way I organized the middlewares is a MESS__.

This is not how I usually do, this is not the best way to be done (for sure) but I didn't want to spend much time writing a "very nice" code, so I will leave a tech debt to make this more human readable later.

__Note__:  at some point I will split the concerns, putting the services in one place and the routing logic in another.

## ES6 Classes / Components and "Old fashion way"

I like ES6 and several other features. But I still don't buy the idea for using Classes / Components for this kind of app. I already used them in production. BUt for simplicity, I still believe if you wanna use such kinda of approach, you should jump to Typescript or even other language. The beauty of Node.JS simplicity goes far from that in most of the cases (and there are several scenarios where that is usefull, but not this one).

## Template rendering and performance

When looking for template rendering, I found `Nunjucks` (https://mozilla.github.io/nunjucks/). This is the best templating library I saw in years for Javascript. Simple, powerfull and very close of `Go Templates`, which is something that I think it is prtetty straightforward. You should try it. For real...

And yes... SSR (server-side-rendering) is a thing again. It is not the death of SPAs (Single Page Apps) but given the security aspects, it came back in a way that makes thing much more simple (again) until humanity discovery a way to do SPAs in a secure way or people stop  trying to break systems and find a better way to spend their time.

__NOTE__ DO NOT EXPECT GOOD PERFORMANCE. This app has awesome performance in you local, but if you go to Heroku, it will be SLOW. That is because I'm using a free tier database, which is shared and has VERY HIGH LATENCY. So, if you wanna speed, pay for a real cluster or run on your local (which makes sense once this app ahs educational purposes).

## Mocha vs other test frameworks

I like `Jest` (https://jestjs.io/), I love `Tape`(https://github.com/substack/tape) and __I HATE__ `Mocha JS`(https://mochajs.org/). Don't get me wrong. I don't really hate it, but I got this feeling after working in a project that used that extensively in a wrong way... and also because I think it is too verbose and do some "magic things" under the hood. I like to know exaclty what my tests are doing (in general) w/o having to add much more frameworks, libraries or read an extense documentation.

So, I added Mocha exactly to give another shot and use it again. I still don't like it. I should switch to Jest or Tape ion the future. You will feel that when reading my tests.

## Tech debt

There are so many things I would like to do here:
- [ ] improve unit test coverage;
- [ ] measure unit test coverage;
- [ ] add integration tests;
- [ ] switch test framework;
- [ ] add some front-end testing;
- [ ] make the code human  readable;
- [ ] add more cool features into it exploring future Node versions and libraries (like Paseto, Mongoose Schemas, Nunjucks, etc.);

