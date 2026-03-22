const missing = []

if (!process.env.DATABASE_URL) {
    missing.push("DATABASE_URL")
}

if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
    missing.push("AUTH_SECRET|NEXTAUTH_SECRET")
}

if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`)
    process.exit(1)
}

console.log("Environment check passed")
