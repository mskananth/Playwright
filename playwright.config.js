// @ts-check
import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests",
  timeout: 40 * 1000,
  expect: {
    timeout: 40 * 1000,
  },
  reporter: "html",

  use: {
    headless: false,
    // Use a fixed viewport and device scale factor so tests run with
    // consistent layout and do not get affected by OS DPI / zoom settings.
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    launchOptions: {
      // Force chromium to use a 1:1 device scale factor and enable
      // high-dpi support so Windows display scaling doesn't zoom the page.
      args: [
        "--window-position=0,0",
        "--window-size=1920,1080",
        "--force-device-scale-factor=1",
        "--high-dpi-support=1",
        "--disable-features=UseZoomForDSF",
      ],
    },
  },
});
