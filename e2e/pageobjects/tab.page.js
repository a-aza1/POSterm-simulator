// Page object: every selector for the tab screen lives here,
// so a UI change means updating one file, not every test.
const byTestId = (id) => $(`[data-testid="${id}"]`);

class TabPage {
  async open() {
    await browser.url('/');
    await byTestId('add-beer').waitForDisplayed(); // the menu has loaded from the API
  }

  get total() { return byTestId('total'); }
  get message() { return byTestId('message'); }
  get payGood() { return byTestId('pay-good'); }
  get payDeclined() { return byTestId('pay-declined'); }

  async addItem(id, times = 1) {
    for (let i = 0; i < times; i++) {
      await byTestId(`add-${id}`).click();
    }
  }
}

export default new TabPage();
