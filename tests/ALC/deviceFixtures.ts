import { test as base, expect, Page, Frame } from '@playwright/test';

type DeviceUtils = {
  commandAnalogDevice: (device: any, value: number) => Promise<void>;
  commandBinaryDevice: (device: any, state: string) => Promise<void>;
  getAnalogFeedback: (device: any) => Promise<void>;
  testAnalogIO: (device: any, value: number) => Promise<void>;
  testBinaryIO: (device: any, state: string) => Promise<void>;
  testBinaryInput: (device: any, state1: string, state2: string) => Promise<void>;
};

export const test = base.extend<{
  page: Page;
  actionContent: Frame | null;
  deviceUtils: DeviceUtils;
}>({
  page: async ({ browser }, use) => {
    const context = await browser.newContext({ bypassCSP: true });
    const page = await context.newPage();
    await page.goto('http://localhost:8080');
    await page.locator('#nameInput').fill('silent');
    await page.locator('#pass').fill('password123');
    await page.getByRole("button", { name: 'Log in' }).click();
    await use(page);
    await context.close();
  },

  actionContent: async ({ page }, use) => {
    const frame = await page.locator("#actionContent").contentFrame();
    await use(frame);
  },

  deviceUtils: async ({ page, actionContent }, use) => {
    const deviceUtils: DeviceUtils = {
      async commandAnalogDevice(device, value) {
        const { lockedValue } = device;
        const currentLockedValue = parseInt(await actionContent.locator("#bodyTable").locator(`[updateid="prim_${lockedValue}_ctrlid1"]`).locator('span').first().textContent());
        if (currentLockedValue !== value) {
          await actionContent.locator("#bodyTable").locator(`[updateid="prim_${lockedValue}_ctrlid1"]`).click();
          await actionContent.locator("#bodyTable").locator(`[updateid="prim_${lockedValue}_ctrlid1"]`).fill(`${value}`);
          await page.keyboard.press("Enter");
        } else {
          console.log(`${device.name} ${value}`);
        }
      },

      async commandBinaryDevice(device, state) {
        const { lockedValue } = device;
        const currentLockedValue = await actionContent.locator("#bodyTable").locator(`[updateid="prim_${lockedValue}_ctrlid1"]`).locator('span').first().textContent();
        if (currentLockedValue !== state) {
          await actionContent.locator("#bodyTable").locator(`[updateid="prim_${lockedValue}_ctrlid1"]`).click();
          try {
            await actionContent.locator('div.ControlLightDropList-WidgetLightDropList-rowinactive').getByText(state).click();
          } catch {
            await actionContent.locator('div.ControlLightDropList-WidgetLightDropList-rowinactive').getByText(state).nth(1).click();
          }
        } else {
          console.log(`${device.name} already ${state}`);
        }
      },

      async getAnalogFeedback(device) {
        const { feedbackValue } = device;
        let value = parseFloat(await actionContent.locator("#bodyTable").locator(`[primid="prim_${feedbackValue}"]`).textContent());
        expect(value).not.toBe('?');
        expect(value).toBeGreaterThanOrEqual(0);
        console.log(`${device.name} initial reading: ${value}`);
        for (let i = 0; i < 400; i++) {
          const feedback = await actionContent.locator("#bodyTable").locator(`[primid="prim_${feedbackValue}"]`).textContent();
          const result = parseFloat(feedback);
          if (Math.abs(value - result) > 0.1) {
            await page.waitForTimeout(500);
            console.log(`${device.name} feedback: ${feedback}`);
            break;
          }
          await new Promise(r => setTimeout(r, 7000));
        }
      },

      async testAnalogIO(device, value) {
        const { feedbackValue } = device;
        await deviceUtils.commandAnalogDevice(device, value);
        let result = 100;
        for (let i = 0; i < 40; i++) {
          const feedback = await actionContent.locator("#bodyTable").locator(`[primid="prim_${feedbackValue}"]`).textContent();
          result = parseInt(feedback);
          if (Math.abs(value - result) < 5) {
            await page.waitForTimeout(7000);
            console.log(`feedback: ${feedback}`);
            break;
          }
          await new Promise(r => setTimeout(r, 7000));
        }
        expect(Math.abs(result - value)).toBeLessThanOrEqual(5);
      },

      async testBinaryIO(device, state) {
        const { commandValue, feedbackValue } = device;
        await deviceUtils.commandBinaryDevice(device, state);
        await expect(actionContent.locator("#bodyTable").locator(`[primid="prim_${commandValue}"]`)).toHaveText(state);
        await expect(actionContent.locator("#bodyTable").locator(`[primid="prim_${feedbackValue}"]`)).toHaveText(state);
        console.log(`${device.name} ${state}`);
      },

      async testBinaryInput(device, state1, state2) {
        const { feedbackValue } = device;
        expect(actionContent.locator("#bodyTable").locator(`[primid="prim_${feedbackValue}"]`)).not.toBe("?");
        await expect(actionContent.locator("#bodyTable").locator(`[primid="prim_${feedbackValue}"]`)).toHaveText(state1);
        console.log(`${device.name}: ${state1} Waiting for state change...`);
        await expect(actionContent.locator("#bodyTable").locator(`[primid="prim_${feedbackValue}"]`)).toHaveText(state2);
        console.log(`${device.name}: ${state2}`);
      }
    };

    await use(deviceUtils);
  }
});