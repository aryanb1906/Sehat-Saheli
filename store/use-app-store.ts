"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

type UserRole = "mother" | "asha" | "doctor" | null

interface AppState {
    userRole: UserRole
    selectedLanguage: string
    setUserRole: (role: UserRole) => void
    setSelectedLanguage: (lang: string) => void
    clearSession: () => void
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            userRole: null,
            selectedLanguage: "en",
            setUserRole: (role) => set({ userRole: role }),
            setSelectedLanguage: (lang) => set({ selectedLanguage: lang }),
            clearSession: () => set({ userRole: null }),
        }),
        {
            name: "sehat-saheli-app-store",
            partialize: (state) => ({
                userRole: state.userRole,
                selectedLanguage: state.selectedLanguage,
            }),
        },
    ),
)
