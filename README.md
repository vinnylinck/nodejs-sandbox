# nodejs-sandbox
A playground project for testing Node.JS features


## A few notes

Here goes the result of some decision I made about the app for future references

### 20220126 - Libraries and frameworks

"Why this and not that?"

#### Logging - Winston vs Bunyan
Winston is the clear winner for speed in multithreaded systems; however, Bunyan performed slightly better in a single-threaded system.

**Decision**: Bunyan


#### Hapi vs Express
Hapi is more suitable for enterprise / intranet and Express and the "standard" for the market... and I also wanted to use it after a long time.

**Decision**: ExpressJS



