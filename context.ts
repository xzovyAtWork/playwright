import { Page, FrameLocator } from '@playwright/test';

let page: Page;
let actionContent: FrameLocator;

function setPage(p: Page) {
  page = p;
  actionContent = p.frameLocator('#yourFrameSelector'); // Replace with actual frame selector
}

export { page, actionContent, setPage };