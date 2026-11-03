import TabPage from '../pageobjects/tab.page.js';

describe('Paying a tab', () => {
  beforeEach(async () => {
    await TabPage.open(); // fresh page for every test
  });

  it('keeps the tab open when the card is declined', async () => {
    await TabPage.addItem('burger');
    await TabPage.payDeclined.click();

    await expect(TabPage.message).toHaveText('Card declined. Try another card.');
    await expect(TabPage.total).toHaveText('Total: $14.00'); // items kept for a retry
  });

  it('clears the tab when the payment is approved', async () => {
    await TabPage.addItem('beer', 2);
    await TabPage.addItem('fries');
    await expect(TabPage.total).toHaveText('Total: $19.50');

    await TabPage.payGood.click();

    await expect(TabPage.message).toHaveText('Paid $19.50. Thanks!');
    await expect(TabPage.total).toHaveText('Total: $0.00');
  });
});
