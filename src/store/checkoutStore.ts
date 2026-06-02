/* Checkout form draft — persisted so a refresh mid-checkout doesn't lose progress. */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CheckoutForm } from '../lib/checkout'

const DEFAULT: CheckoutForm = {
  orderType: 'Delivery',
  name: '',
  phone: '',
  email: '',
  postcode: '',
  addressLine: '',
  instructions: '',
  timingMode: 'asap',
  scheduledFor: '',
  payment: 'Cash',
  contactless: false,
  cutlery: false,
  allergyAck: true as const,
}

type CheckoutState = {
  form: CheckoutForm
  step: number
  setForm: (patch: Partial<CheckoutForm>) => void
  setStep: (step: number) => void
  reset: () => void
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      form: { ...DEFAULT, allergyAck: false as unknown as true },
      step: 0,
      setForm: (patch) => set((s) => ({ form: { ...s.form, ...patch } })),
      setStep: (step) => set({ step }),
      reset: () => set({ form: { ...DEFAULT, allergyAck: false as unknown as true }, step: 0 }),
    }),
    { name: 'forno-checkout' },
  ),
)
