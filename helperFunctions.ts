import { expect } from '@playwright/test';
import { page, actionContent } from './context';

async function commandAnalogDevice(device, value: number){
	const { lockedValue } = device
	const currentLockedValue = await parseInt(actionContent.locator("#bodyTable").locator(`[updateid="prim_${lockedValue}_ctrlid1"]`).locator('span').first().textContent());
	if(currentLockedValue !== value){
		await actionContent.locator("#bodyTable").locator(`[updateid="prim_${lockedValue}_ctrlid1"]`).click();
		await actionContent.locator("#bodyTable").locator(`[updateid="prim_${lockedValue}_ctrlid1"]`).fill(`${value}`);
		await page.keyboard.press("Enter")
	}else {
		console.log(`${device.name} ${value}`)
	}
}
async function commandBinaryDevice(device, state){
	const {lockedValue} = device
	const currentLockedValue = await actionContent.locator("#bodyTable").locator(`[updateid="prim_${lockedValue}_ctrlid1"]`).locator('span').first().textContent();
	if(currentLockedValue != state){
		await actionContent.locator("#bodyTable").locator(`[updateid="prim_${lockedValue}_ctrlid1"]`).click();
		try{
			await actionContent.locator('div.ControlLightDropList-WidgetLightDropList-rowinactive').getByText(state).click();
		}catch(err){
			await actionContent.locator('div.ControlLightDropList-WidgetLightDropList-rowinactive').getByText(state).nth(1).click();
		}

	}else{
		console.log(`${device.name} already ${state}`)
	}
};
async function getAnalogFeedback(device){
	const {feedbackValue} = device
	let result;
	let value = parseFloat(await actionContent.locator("#bodyTable").locator(`[primid="prim_${feedbackValue}"]`).textContent());
	expect(value).not.toBe('?')
	expect(value).toBeGreaterThanOrEqual(0);
	console.log(`${device.name} initial reading: ${value}`)
	for (let i = 0; i < 400; i++) {
		let feedback = await actionContent.locator("#bodyTable").locator(`[primid="prim_${feedbackValue}"]`).textContent();
		result = parseFloat(feedback);
		if (Math.abs(value - result) > 0.1 ) {
			await page.waitForTimeout(500);
			console.log(`${device.name} feedback: ${feedback}`);
			break;
		}
		feedback = await actionContent.locator("#bodyTable").locator(`[primid="prim_${feedbackValue}"]`).textContent();
		await new Promise(r => setTimeout(r, 7000));
	}
}
async function testAnalogIO(device, value) {
	const {feedbackValue, commandValue, lockedValue} = device
	await commandAnalogDevice(device, value);
	let result = 100;
	for (let i = 0; i < 40; i++) {
		let feedback = await actionContent.locator("#bodyTable").locator(`[primid="prim_${feedbackValue}"]`).textContent();
		result = parseInt(feedback);
		if (Math.abs(value - result) < 5) {
			await page.waitForTimeout(7000);
			console.log(`feedback: ${feedback}`);
			break;
		}
		feedback = await actionContent.locator("#bodyTable").locator(`[primid="prim_${feedbackValue}"]`).textContent();
		await new Promise(r => setTimeout(r, 7000));
	}
	expect(Math.abs(result - value)).toBeLessThanOrEqual(5);
}
async function testBinaryIO(device, state) {
	await commandBinaryDevice(device, state);
	const {commandValue, feedbackValue} = device;
	await expect(actionContent.locator("#bodyTable").locator(`[primid="prim_${commandValue}"]`)).toHaveText(state);
	await expect(actionContent.locator("#bodyTable").locator(`[primid="prim_${feedbackValue}"]`)).toHaveText(state);
	console.log(`${device.name} ${state}`)
}
async function testBinaryInput(device, state1, state2){
	const {feedbackValue} = device;
	expect(actionContent.locator("#bodyTable").locator(`[primid="prim_${feedbackValue}"]`)).not.toBe("?")
	await expect(actionContent.locator("#bodyTable").locator(`[primid="prim_${feedbackValue}"]`)).toHaveText(state1);
	console.log(`${device.name}: ${state1} Waiting for state change...`);
	await expect(actionContent.locator("#bodyTable").locator(`[primid="prim_${feedbackValue}"]`)).toHaveText(state2);
	console.log(`${device.name}: ${state2}`)
}


export {
	commandAnalogDevice,
	commandBinaryDevice,
	getAnalogFeedback,
	testAnalogIO,
	testBinaryIO,
	testBinaryInput
}