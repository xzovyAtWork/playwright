//@ts-check
import { expect, Page, Context} from '@playwright/test';
import {devices} from '../../alcDevices';
require('log-timestamp')(()=>`${new Date().toLocaleTimeString()}`);
import {test} from './deviceFixtures'

const {wll, whl, wol, leak1, leak2} = devices
const {fill, drain} = devices;
const {faceDamper, bypassDamper} = devices;
const {primary, secondary} = devices;
const {sump, bleed, conductivity} = devices;
const {rh1, rh2, maTemp, saTemp} = devices;
const {vfd, vfdEnable, vfdFault, vfdHOA, airflow} = devices;
const {sf1, sf2,sf3, sf4, sf5, sf6} = devices;


test.beforeEach(async ({ }, testInfo) => {
	console.log(`Started ${testInfo.title}...`);
})
test.afterEach(async ({ }, testInfo) => {
	console.log(`✅ Completed test: ${testInfo.title}`);
});
test.beforeEach(async ({ }, testInfo) => {
	console.log(`Started ${testInfo.title}...`);
})
test.afterEach(async ({ }, testInfo) => {
	console.log(`✅ Completed test: ${testInfo.title}`);
});
test('download program', async ({ page, actionContent }) => {
	// test.describe.configure({retries: 3})
	test.setTimeout(10 * 60000)
	let text;
	console.log('downloading controller program...');
	await page.waitForLoadState();
	await page.evaluate(() => window.invokeManualCommand('download'));
	await expect(actionContent.locator("#ch_message_div", {hasText: "Downloading"})).toBeVisible();
	while(await actionContent.locator("#ch_message_div", {hasText: "Downloading"}).isVisible()){
		text = await actionContent.locator("#ch_message_div").first().textContent();
		console.log(`${text}`);
		await page.waitForTimeout(5000);
	}
	await expect(actionContent.locator("#ch_message_div", {hasText: "Downloading"})).not.toBeVisible()
	await expect(actionContent.locator("#ch_message_div").first()).not.toBeVisible()
	console.log(text)
	console.log('program download complete');
})
test('check faults', async ({actionContent}) =>{
	for(let i = 0; i < 59; ++i){
		let firstColumn = await actionContent.locator('#bodyTable').locator('tr').nth(i).locator('td').first().locator('span')
		const color = await firstColumn.evaluate(el =>
			window.getComputedStyle(el).getPropertyValue('color')
		  );
		  
		if(color == 'rgb(255, 0, 0)'){			
			console.log(`${await firstColumn.textContent()} faulted`)
		}
	}	
})
test.describe('low voltage', () => {
	test.describe.configure({ mode: 'serial' });
	// test.beforeAll(async ({page, deviceUtils})=>{
	// 	await page.waitForTimeout(5000)
	// 	await deviceUtils.commandBinaryDevice(fill, "Close");
	// 	await deviceUtils.commandBinaryDevice(drain, "Close");
	// 	await deviceUtils.commandBinaryDevice(bleed, "Off");
	// 	await deviceUtils.commandBinaryDevice(sump, "Off");
	// 	await deviceUtils.commandBinaryDevice(vfdEnable, "Disable");
	// 	await deviceUtils.commandAnalogDevice(vfd, 0);
	// 	await deviceUtils.commandAnalogDevice(faceDamper, 20);
	// 	await deviceUtils.commandAnalogDevice(bypassDamper, 100);
	// })
	test('mech gallery leak / mpdc', async ({deviceUtils}) => {
		test.setTimeout(60000);
		const mpdc = deviceUtils.testBinaryInput(leak1, 'Normal', 'Alarm');
		const mechGalleryLeak = deviceUtils.testBinaryInput(leak2, 'Normal', 'Alarm');
		try {
			await Promise.any([mechGalleryLeak, mpdc]);
		} catch (err) {
			console.error('Both tests failed, aborting...');
			throw err;
		}
	});
	test('fill actuator', async ({deviceUtils, actionContent}) => {
		expect(await actionContent.locator("#bodyTable").locator(`[primid="prim_${fill.feedbackValue}"]`)).toHaveText("Open", {timeout: 10 * 60000})
		await deviceUtils.testBinaryIO(fill, "Open");
		await deviceUtils.testBinaryIO(fill, "Close");
	})
	test('drain actuator', async ({deviceUtils}) => {
		expect(await actionContent.locator("#bodyTable").locator(`[primid="prim_${drain.feedbackValue}"]`)).toHaveText("Close", {timeout: 10 * 60000})
		await deviceUtils.testBinaryIO(drain, "Open");
		await deviceUtils.testBinaryIO(drain , "Close");
	})
	test('wll', async ({deviceUtils}) => {
		await deviceUtils.testBinaryInput(wll, 'Low', 'Normal');
	})
	test('wol', async ({deviceUtils}) => {
		await deviceUtils.testBinaryInput(wol, 'Low', 'Normal');
	})
	test('whl', async ({deviceUtils}) => {
		await deviceUtils.testBinaryInput(whl, 'Normal', 'Alarm');
	})
	test('ma temp', async ({deviceUtils})=>{
		await deviceUtils.getAnalogFeedback(maTemp)
	})
	test('rh1', async ({deviceUtils})=>{
		await deviceUtils.getAnalogFeedback(rh1)
	})
	test('rh2', async ({deviceUtils})=>{
		await deviceUtils.getAnalogFeedback(rh2)
	})
	test('sa temp', async ({deviceUtils})=>{
		await deviceUtils.getAnalogFeedback(saTemp)
	})
	test('face damper', async ({deviceUtils}) => {
		test.setTimeout(5 * 60000);
		await deviceUtils.testAnalogIO(faceDamper, 20);
		await deviceUtils.testAnalogIO(faceDamper, 50);
		await deviceUtils.testAnalogIO(faceDamper, 100);
		await deviceUtils.commandAnalogDevice(faceDamper, 20);
	})
	test('bypass damper', async ({deviceUtils}) => {
		test.setTimeout(5 * 60000)
		await deviceUtils.testAnalogIO(bypassDamper, 100);
		await deviceUtils.testAnalogIO(bypassDamper, 50);
		await deviceUtils.testAnalogIO(bypassDamper, 20);
		await deviceUtils.commandAnalogDevice(bypassDamper, 100)
	})
})
test('fill tank',async({deviceUtils}) => {
	test.setTimeout(0)
	await deviceUtils.commandBinaryDevice(fill, 'Open');
	await deviceUtils.commandBinaryDevice(drain, 'Close');
	await expect(await actionContent.locator("#bodyTable").locator(`[primid="prim_${wol.feedbackValue}"]`)).toHaveText("Normal", {timeout: 10 * 60000})
	
})
test.describe('evap section', async () => {
	test.describe.configure({ mode: 'serial' });
	test.beforeEach(async ({page})=>{
		await page.waitForLoadState();
	})
	test('sump current switch', async ({deviceUtils}) => {
		await deviceUtils.commandBinaryDevice(sump, "On");
		await deviceUtils.testBinaryInput(sump, 'Off', 'On');
	})
	test('conductivity', async ({deviceUtils, actionContent}) => {
		const conductivityReading = parseFloat(await actionContent.locator("#bodyTable").locator(`[primid="prim_${conductivity.feedbackValue}"]`).textContent());
		expect(conductivityReading).toBeGreaterThan(100);
		await deviceUtils.getAnalogFeedback(conductivity);
	})
	
})
test.describe('bypass', async () => {
	test.describe.configure({ mode: 'serial' });
	test('bleed', async ({deviceUtils, page})=>{
		test.setTimeout(6 * 60000)
		await deviceUtils.commandBinaryDevice(bleed, "On");
		console.log('bleed on for 5 minutes')
		await page.waitForTimeout(5 * 60000);
		await deviceUtils.commandBinaryDevice(bleed, "Off");
		console.log('bleed off. turn off main water supply')
	})
	test('run bypass', async ({deviceUtils, page})=>{
		test.setTimeout(31 * 60000)
		console.log('running bypass for additional 25 minutes')
		await page.waitForTimeout(25 * 60000);
		await deviceUtils.commandBinaryDevice(sump, "Off");
		console.log('bypass test done. check for leaks')
	})
	test('drain tank', async ({deviceUtils}) => {
		await deviceUtils.commandBinaryDevice(drain, "Open");
	})
})
test.describe('full water', async () => {
	const conductivityReadings = [];
	test('rinse cycle', async ({deviceUtils, page}) => {
		async function getConductivityValue(){
			await page.waitForTimeout(10000);
			const conductivityReading = parseFloat(await actionContent.locator("#bodyTable").locator(`[primid="prim_${conductivity.feedbackValue}"]`).textContent());
			conductivityReadings.push(conductivityReading)
			return conductivityReading;
		}
		test.setTimeout(0);
		await deviceUtils.commandBinaryDevice(fill, 'Open')
		await deviceUtils.commandBinaryDevice(drain, 'Close');
		console.log('waiting for tank to fill...')
		await expect(await actionContent.locator("#bodyTable").locator(`[primid="prim_${wol.feedbackValue}"]`)).toHaveText("Normal", {timeout: 10 * 60000})
		await deviceUtils.commandBinaryDevice(sump, 'On');
		const startValue = await getConductivityValue();
		console.log(`starting cycle. Conductivity: ${startValue}`)
		if(startValue > 600){
			await deviceUtils.commandBinaryDevice(bleed, 'On');
		}
		await page.waitForTimeout(30 * 60000);
		console.log(`cycle complete. Draining tank. Conductivity: ${await getConductivityValue()}`)
		await deviceUtils.commandBinaryDevice(fill, 'Close');
		await deviceUtils.commandBinaryDevice(drain, 'Open');
		await deviceUtils.commandBinaryDevice(sump, 'Off');
		await deviceUtils.commandBinaryDevice(bleed, 'Off');
		await expect(await actionContent.locator("#bodyTable").locator(`[primid="prim_${wll.feedbackValue}"]`)).toHaveText("Low", {timeout: 10 * 60000})
		console.log('Conductivity Readings',conductivityReadings);
	})
})
test.describe('motor section', async () => {
	test.describe.configure({ mode: 'serial' });
	test('secondary power status', async({deviceUtils}) => {
		await deviceUtils.testBinaryInput(secondary, 'Off', 'On');
	})
	test('primary power status', async({deviceUtils}) => {
		await deviceUtils.testBinaryInput(primary, 'On', 'Off')
	})
	test('vfd fault', async ({deviceUtils}) => {
		await deviceUtils.testBinaryInput(vfdFault, 'Off', 'On');
	})
	test('motor current switches', async ({deviceUtils}) => {
		const fans = [sf1, sf2, sf3, sf4, sf5, sf6]
		for(const fan of fans){
			console.log(fan.name)
			await deviceUtils.testBinaryInput(fan, 'On', 'Off');
		}
	})	
	test('vfd HOA', async ({deviceUtils}) => {
		test.setTimeout(10 * 60000);
		await deviceUtils.testBinaryInput(vfdHOA, 'Off', 'On');
	})

	test('vfd feedback and airflow', async ({deviceUtils, page, actionContent}) => {
		test.setTimeout(0);
		await deviceUtils.commandBinaryDevice(vfdEnable, 'Enable')
		const getAirflowReading = async () => {
			return parseFloat(await actionContent.locator("#bodyTable").locator(`[primid="prim_${airflow.feedbackValue}"]`).textContent())
		}
		await deviceUtils.testAnalogIO(vfd, 0);
		console.log(await getAirflowReading())
		await deviceUtils.testAnalogIO(vfd, 25);
		console.log(await getAirflowReading())
		await deviceUtils.testAnalogIO(vfd, 50);
		console.log(await getAirflowReading())
		await deviceUtils.testAnalogIO(vfd, 75);
		console.log(await getAirflowReading())
		await deviceUtils.testAnalogIO(vfd, 100);
		await page.waitForTimeout(3000);
		expect(await getAirflowReading()).toBeGreaterThanOrEqual(45000);
	})
	test('run fans and test VFD enable', async ({page,deviceUtils}) => {
		test.setTimeout(0)
		console.log('running fans for 30 minutes')
		await page.waitForTimeout(30 * 60000);
		await deviceUtils.commandBinaryDevice(vfdEnable, 'Disable');
	})
})
test('manually operate unit', async ({deviceUtils}) => {
	test.setTimeout(0)
	return new Promise(() => { })
})