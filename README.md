# POSterm-simulator

Small side project for practicing how I'd test a POS payment flow without needing a real card terminal on my desk.

There's a tiny Node API that acts like the terminal, a one-page React app that pays through it, and a couple layers of tests on top.

## What's in here

- `api/` - the fake terminal. Plain Node, no dependencies. Jest + Supertest tests are in `api/__tests__`.
- `web/` - single page React app (pulls React from a CDN so there's no build step)
- `mobile/` - same screen in React Native, if you want to run it with Expo
- `e2e/` - WebdriverIO tests that click through the web app in Chrome

## Running it

```
cd api
npm install
npm test
npm start
```

Then open http://localhost:3000.

For the WebdriverIO tests:

```
cd e2e
npm install
npm test
```

They'll start the API on their own if it's not already running. The first run takes a minute because WebdriverIO downloads its own Chrome. If you want to actually watch what it's doing, slow it down with `SLOW=800 npm test`.

## How the "terminal" works

Three endpoints:

- `GET /menu`
- `POST /tabs` with something like `{ "items": [{ "itemId": "beer", "quantity": 2 }] }`
- `POST /tabs/:id/pay` with `{ "card": "4242424242424242" }`

4242 4242 4242 4242 gets approved, anything else gets declined (402). Trying to pay the same tab twice gets a 409, and junk input gets a 400 instead of taking the server down.

## What the tests cover

API (Jest):
- menu comes back with prices
- opening a tab gets the total right
- good card pays the tab
- declined card returns 402 and leaves the tab open so you can retry
- a paid tab can't be charged twice (the bug I'd least want to ship)

End to end (WebdriverIO):
- declined card shows the error and keeps your items
- good card pays and clears the tab

## If I kept going

- a "terminal timeout" card. If a terminal times out after reading the card, the charge might have actually gone through, so a retry needs to check first
- Maestro or Appium tests against the native app
- run all of this in GitHub Actions