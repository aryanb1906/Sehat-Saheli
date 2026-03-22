import { defineConfig, devices } from "@playwright/test"

const useExistingServer = process.env.PLAYWRIGHT_USE_EXISTING_SERVER === "1"
const baseURL = useExistingServer ? "http://127.0.0.1:3100" : "http://127.0.0.1:4173"

export default defineConfig({
    testDir: "./e2e",
    timeout: 30_000,
    expect: {
        timeout: 10_000,
    },
    fullyParallel: true,
    use: {
        baseURL,
        trace: "on-first-retry",
    },
    ...(useExistingServer
        ? {}
        : {
            webServer: {
                command: "npx next dev -p 4173",
                url: "http://127.0.0.1:4173",
                reuseExistingServer: true,
                timeout: 120_000,
            },
        }),
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
})
