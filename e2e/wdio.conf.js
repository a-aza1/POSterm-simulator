// WebdriverIO config: runs the specs in Chrome against the app at http://localhost:3000.
// WebdriverIO downloads a matching Chrome and driver automatically on the first run.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const BASE_URL = 'http://localhost:3000';
const apiIsUp = () => fetch(`${BASE_URL}/menu`).then((res) => res.ok).catch(() => false);
let api;

export const config = {
  runner: 'local',
  specs: ['./specs/**/*.e2e.js'],
  maxInstances: 1,
  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': {
        // Phone-sized window. Run with HEADLESS=1 to hide the browser.
        args: ['--window-size=420,900', ...(process.env.HEADLESS ? ['--headless=new'] : [])],
      },
    },
  ],
  baseUrl: BASE_URL,
  logLevel: 'warn',
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: { timeout: 60000 },

    // Slowmo for watching: SLOW=800 npm test (m/s between actions)
  beforeCommand: async () => {
    if (process.env.SLOW) await new Promise((resolve) => setTimeout(resolve, Number(process.env.SLOW)));
  },
  // In slow motion, keep the browser open a few seconds at the end
  after: async () => {
    if (process.env.SLOW) await new Promise((resolve) => setTimeout(resolve, 3000));
  },

  // Start the API if it isn't already running, and stop it afterward.
  onPrepare: async () => {
    if (await apiIsUp()) return;
    const server = fileURLToPath(new URL('../api/src/server.js', import.meta.url));
    api = spawn('node', [server], { stdio: 'ignore' });
    for (let i = 0; i < 40; i++) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      if (await apiIsUp()) return;
    }
    throw new Error('The API did not start on port 3000');
  },
  onComplete: () => {
    api?.kill();
  },
};
