// Jest runs the tests; Supertest sends real HTTP requests to the app.
const request = require('supertest');
const { createApp, GOOD_CARD } = require('../src/app');

const DECLINED_CARD = '4000000000000002';
let app;

beforeEach(() => {
  app = createApp(); // fresh data for every test
});

// Opens a tab with 2 beers and 1 fries ($19.50)
const openTab = async () =>
  (await request(app).post('/tabs').send({ items: [{ itemId: 'beer', quantity: 2 }, { itemId: 'fries', quantity: 1 }] })).body;

test('GET /menu returns the menu with prices', async () => {
  const res = await request(app).get('/menu');
  expect(res.status).toBe(200);
  expect(res.body).toHaveLength(3);
  expect(res.body[0]).toEqual({ id: 'beer', name: 'Draft Beer', priceCents: 700 });
});

test('POST /tabs opens a tab with the correct total', async () => {
  const tab = await openTab();
  expect(tab.status).toBe('open');
  expect(tab.totalCents).toBe(1950); // 2 x $7.00 + $5.50
});

test('paying with a good card marks the tab paid', async () => {
  const tab = await openTab();
  const res = await request(app).post(`/tabs/${tab.id}/pay`).send({ card: GOOD_CARD });
  expect(res.status).toBe(200);
  expect(res.body.status).toBe('paid');
});

test('a declined card returns 402 and keeps the tab open', async () => {
  const tab = await openTab();
  const res = await request(app).post(`/tabs/${tab.id}/pay`).send({ card: DECLINED_CARD });
  expect(res.status).toBe(402);

  const retry = await request(app).post(`/tabs/${tab.id}/pay`).send({ card: GOOD_CARD });
  expect(retry.status).toBe(200); // still open, so the customer can retry
});

test('a paid tab cannot be charged twice', async () => {
  const tab = await openTab();
  await request(app).post(`/tabs/${tab.id}/pay`).send({ card: GOOD_CARD });
  const second = await request(app).post(`/tabs/${tab.id}/pay`).send({ card: GOOD_CARD });
  expect(second.status).toBe(409);
});
