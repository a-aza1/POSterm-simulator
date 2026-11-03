// A tiny POS API on Node's built-in http module. It simulates a card terminal
// with test card numbers, so payments can be tested without real hardware.
const crypto = require('node:crypto');

const MENU = [
  { id: 'beer', name: 'Draft Beer', priceCents: 700 }, // prices in whole cents, never decimals
  { id: 'fries', name: 'Fries', priceCents: 550 },
  { id: 'burger', name: 'Burger', priceCents: 1400 },
];

const GOOD_CARD = '4242424242424242'; // any other card is declined

function createApp() {
  const tabs = {}; // in memory; a fresh store for each app, so tests don't share data

  const send = (res, status, body) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  };

  const readBody = (req) =>
    new Promise((resolve, reject) => {
      let raw = '';
      req.on('data', (chunk) => (raw += chunk));
      req.on('end', () => {
        try {
          resolve(JSON.parse(raw || '{}'));
        } catch (err) {
          reject(err); // broken JSON becomes a 400 below
        }
      });
    });

  const route = async (req, res) => {
    // 1. GET /menu
    if (req.method === 'GET' && req.url === '/menu') {
      return send(res, 200, MENU);
    }

    // 2. POST /tabs  { items: [{ itemId, quantity }] }
    if (req.method === 'POST' && req.url === '/tabs') {
      const { items = [] } = await readBody(req);
      if (items.length === 0) return send(res, 400, { error: 'tab needs at least one item' });

      const totalCents = items.reduce((sum, { itemId, quantity }) => {
        const item = MENU.find((m) => m.id === itemId);
        return sum + item.priceCents * quantity;
      }, 0);
      const tab = { id: crypto.randomUUID(), items, totalCents, status: 'open' };
      tabs[tab.id] = tab;
      return send(res, 201, tab);
    }

    // 3. POST /tabs/:id/pay  { card }
    const match = req.url.match(/^\/tabs\/(.+)\/pay$/);
    if (req.method === 'POST' && match) {
      const tab = tabs[match[1]];
      if (!tab) return send(res, 404, { error: 'tab not found' });
      if (tab.status === 'paid') return send(res, 409, { error: 'tab is already paid' }); // no double charges

      const { card } = await readBody(req);
      if (card !== GOOD_CARD) return send(res, 402, { error: 'card declined' });

      tab.status = 'paid';
      return send(res, 200, tab);
    }

    send(res, 404, { error: 'not found' });
  };

  // Bad input (broken JSON, an unknown item) gets a 400 instead of crashing the server.
  return async (req, res) => {
    try {
      await route(req, res);
    } catch {
      send(res, 400, { error: 'bad request' });
    }
  };
}

module.exports = { createApp, GOOD_CARD };
