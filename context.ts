import { Page, FrameLocator } from '@playwright/test';

let page: Page;
let actionContent: FrameLocator;

function setPage(p: Page) {
  page = p;
  actionContent = p.locator("#actionContent").contentFrame();
}

export { page, actionContent, setPage };