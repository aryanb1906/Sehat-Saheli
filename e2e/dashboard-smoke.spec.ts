import { test, expect } from "@playwright/test"

test.describe("Dashboard smoke tests", () => {
    test.beforeEach(async ({ context }) => {
        await context.addCookies([
            {
                name: "sehat_guest",
                value: "1",
                domain: "127.0.0.1",
                path: "/",
                httpOnly: false,
                secure: false,
                sameSite: "Lax",
            },
        ])
    })

    test("mother dashboard renders key sections", async ({ page }) => {
        await page.goto("/mother")

        await expect(page.getByRole("heading", { name: /primary actions/i })).toBeVisible()
        await expect(page.getByRole("heading", { name: /daily insights/i })).toBeVisible()
        await expect(page.getByRole("button", { name: /sos/i })).toBeVisible()
    })

    test("asha dashboard renders key sections", async ({ page }) => {
        await page.goto("/asha")

        await expect(page.getByRole("heading", { name: /quick actions/i })).toBeVisible()
        await expect(page.getByRole("heading", { name: /patient directory/i })).toBeVisible()
        await expect(page.getByText(/continue training/i)).toBeVisible()
    })
})
