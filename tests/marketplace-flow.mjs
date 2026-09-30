import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "playwright-core";

const siteRoot = mkdtempSync(join(tmpdir(), "gos-marketplace-e2e-"));
symlinkSync(resolve("out"), join(siteRoot, "gos-prototype1"), "dir");

const server = spawn(
  "python3",
  ["-m", "http.server", "4173", "--bind", "127.0.0.1", "--directory", siteRoot],
  { stdio: "ignore" },
);

const waitForServer = async () => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch("http://127.0.0.1:4173/gos-prototype1/login/");
      if (response.ok) return;
    } catch {}
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 100));
  }
  throw new Error("Static test server did not start");
};

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto("http://127.0.0.1:4173/gos-prototype1/login/");
  await page.evaluate(() => localStorage.clear());
  await page.getByRole("button", { name: /Continue to workspace/i }).click();
  await page.getByRole("button", { name: /Blaauwklippen/i }).click();

  const workspaceCards = page.locator(".app-card:not(.marketplace)");
  for (let index = 0; index < (await workspaceCards.count()); index += 1) {
    const card = workspaceCards.nth(index);
    const description = await card.locator("small").boundingBox();
    const launchControl = await card.locator("i").boundingBox();
    assert.ok(
      description && launchControl && description.y + description.height <= launchControl.y,
      `Workspace card ${index + 1} description overlaps its launch control`,
    );
  }

  await page.getByRole("button", { name: "Marketplace", exact: true }).first().click();
  const marketCard = page.locator(".market-grid article").filter({ hasText: "Risk Atlas" });
  await marketCard.getByRole("button", { name: /Install trial/i }).click();
  const installer = page.getByRole("dialog", { name: /Choose Risk Atlas features/i });
  await installer.getByRole("button", { name: /^Controls\b/i }).click();
  await assert.doesNotReject(() =>
    installer.getByText(/also requires Risk register/i).waitFor(),
  );
  await installer.getByRole("button", { name: /Include required features/i }).click();
  await installer.getByRole("button", { name: /Install 2 features/i }).click();
  await assert.doesNotReject(() => marketCard.getByRole("button", { name: /Installed/i }).waitFor());

  await page.getByRole("button", { name: "Apps", exact: true }).first().click();
  const installedCard = page.locator(".installed-app").filter({ hasText: "Risk Atlas" });
  await assert.doesNotReject(() => installedCard.waitFor());
  assert.match(await installedCard.textContent(), /Trial/i);
  assert.match(await installedCard.textContent(), /professional plan/i);
  assert.equal(await installedCard.locator(".enabled-features span").count(), 2);
  assert.match(await installedCard.textContent(), /Risk register/i);
  assert.match(await installedCard.textContent(), /Controls/i);

  await installedCard.getByRole("button", { name: "Uninstall", exact: true }).click();
  await installedCard.waitFor({ state: "detached" });
  assert.equal(await page.locator(".installed-app").filter({ hasText: "Risk Atlas" }).count(), 0);

  await page.getByRole("button", { name: /Browse Marketplace/i }).click();
  await assert.doesNotReject(() =>
    page
      .locator(".market-grid article")
      .filter({ hasText: "Risk Atlas" })
      .getByRole("button", { name: /Install trial/i })
      .waitFor(),
  );
  console.log("Marketplace E2E passed: dependency prompt -> 2-feature install -> Apps -> uninstall.");
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
