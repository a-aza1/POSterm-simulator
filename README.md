# POSterm-simulator

A small demo of testing a point-of-sale (POS) payment flow without a physical card terminal.

- `api/`: a tiny Node.js API that simulates the card terminal (no dependencies), with 5 Jest + Supertest tests
- `mobile/`: a one-screen React Native app that pays through the API

## The API

| Method | Path | What it does |
|---|---|---|
| GET | `/menu` | Menu items with prices in cents |
| POST | `/tabs` | Open a tab: `{ "items": [{ "itemId": "beer", "quantity": 2 }] }` |
| POST | `/tabs/:id/pay` | Pay it: `{ "card": "4242424242424242" }` |

Card `4242424242424242` is approved (200). Any other card is declined (402). Paying a tab twice returns 409.

## Run it

```bash
cd api
npm install
npm test        # runs the 5 API tests
npm start       # API on http://localhost:3000
```

App (in a second terminal):

```bash
npx create-expo-app@latest posterm-app --template blank-typescript
cp mobile/App.tsx posterm-app/App.tsx
cd posterm-app && npx expo start      # press i for the iOS simulator
```

## The tests

1. The menu loads with prices
2. Opening a tab calculates the right total
3. A good card pays the tab
4. A declined card returns 402 and keeps the tab open for a retry
5. A paid tab can't be charged twice
