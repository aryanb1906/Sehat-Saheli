type Role = "MOTHER" | "ASHA" | "DOCTOR"

interface DevUser {
    id: string
    name: string
    email: string
    role: Role
    passwordHash: string
}

const users = new Map<string, DevUser>()

export function findDevUserByEmail(email: string) {
    return users.get(email.toLowerCase()) || null
}

export function createDevUser(input: Omit<DevUser, "id">) {
    const id = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const user: DevUser = { id, ...input, email: input.email.toLowerCase() }
    users.set(user.email, user)
    return user
}

export function upsertDevSeedUser(input: Omit<DevUser, "id"> & { id: string }) {
    users.set(input.email.toLowerCase(), {
        id: input.id,
        name: input.name,
        email: input.email.toLowerCase(),
        role: input.role,
        passwordHash: input.passwordHash,
    })
}
