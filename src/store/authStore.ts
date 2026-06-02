/* Mock auth — phone-first. Persisted. No real backend; gates account UI only.
   NOTE: localStorage auth is a mock for this prototype. A production build must use
   httpOnly cookies + a real auth provider; never trust this client state for access. */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SavedAddress = { id: string; label: string; postcode: string; line: string }

export type User = {
  name: string
  phone: string
  email?: string
  addresses: SavedAddress[]
}

type AuthState = {
  user?: User
  login: (phone: string, name?: string) => void
  logout: () => void
  update: (patch: Partial<User>) => void
  addAddress: (addr: Omit<SavedAddress, 'id'>) => void
  removeAddress: (id: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: undefined,
      login: (phone, name = 'Guest') =>
        set({ user: { name, phone, addresses: [] } }),
      logout: () => set({ user: undefined }),
      update: (patch) => set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
      addAddress: (addr) =>
        set((s) =>
          s.user
            ? { user: { ...s.user, addresses: [...s.user.addresses, { ...addr, id: `a-${Date.now()}` }] } }
            : s,
        ),
      removeAddress: (id) =>
        set((s) =>
          s.user ? { user: { ...s.user, addresses: s.user.addresses.filter((a) => a.id !== id) } } : s,
        ),
    }),
    { name: 'forno-auth' },
  ),
)
