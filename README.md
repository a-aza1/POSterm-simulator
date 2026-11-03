# POSterm-simulator

A small demo of testing a point-of-sale (POS) payment flow without a physical card terminal.

- `api/`: a tiny Node.js API that simulates the card terminal (no dependencies), with 5 Jest + Supertest tests
- `web/index.html`: a one-screen React page that pays through the API (React from a CDN, nothing to install)
- `mobile/App.tsx`: the same screen written in React Native, for running in Expo
- `e2e/`: 2 end-to-end WebdriverIO tests that drive the web app in Chrome

## Run it

```bash
cd api
npm install
npm test        # runs the 5 API tests
npm start       # then open http://localhost:3000
```

## The API

| Method | Path | What it does |
|---|---|---|
| GET | `/menu` | Menu items with prices in cents |
| POST | `/tabs` | Open a tab: `{ "items": [{ "itemId": "beer", "quantity": 2 }] }` |
| POST | `/tabs/:id/pay` | Pay it: `{ "card": "4242424242424242" }` |

Card `4242424242424242` is approved (200). Any other card is declined (402). Paying a tab twice returns 409. Bad input gets a 400.

## The tests

**API tests (Jest + Supertest):** `cd api && npm test`

1. The menu loads with prices
2. Opening a tab calculates the right total
3. A good card pays the tab
4. A declined card returns 402 and keeps the tab open for a retry
5. A paid tab can't be charged twice

**End-to-end tests (WebdriverIO):** `cd e2e && npm install && npm test`

These open the app in a phone-sized Chrome window and click through it like a user. They start the API automatically if it isn't running. Add `HEADLESS=1` to run without a visible browser.

1. A declined card shows a message and keeps the tab open
2. A good card pays the tab and clears it

The tests use a page object (`e2e/pageobjects/tab.page.js`) and stable `data-testid` selectors. The same structure points at the native app through Appium by swapping the browser settings for iOS and Android ones.
