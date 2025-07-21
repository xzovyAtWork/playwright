import { test, expect, Page, FrameLocator} from '@playwright/test';
require('log-timestamp')(()=>`${new Date().toLocaleTimeString()}`);
test('set controller IP', async ({ page }) => {
	console.log('opening My Module/ports...')
	await page.goto('http://169.254.1.1/ports');
	await page.waitForLoadState();
	console.log('page loaded')
	if(await page.getByRole('radio', { name: 'Custom Static' }).isChecked()){
		await page.getByLabel('Default').click();
		await page.getByRole("button", { name: 'Save' }).click();
		console.log('restarting device...')
		await expect(page.getByText("Restarting Device")).toBeVisible();
		await expect(page.getByText('IP Port')).toBeVisible();
		console.log("Controller restarted and IP changed");
	}else {
		console.log("Controller IP already set to 192.168.168.128")
	}
})