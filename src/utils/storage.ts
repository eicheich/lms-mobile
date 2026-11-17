import { Preferences } from '@capacitor/preferences'
import { Capacitor } from '@capacitor/core'

const isNative = Capacitor.isNativePlatform()

export const storage = {
  getSync(key: string): string | null {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },

  async set(key: string, value: string): Promise<void> {
    try {
      window.localStorage.setItem(key, value)
    } catch {}
    if (isNative) {
      await Preferences.set({ key, value }).catch(() => {})
    }
  },

  async get(key: string): Promise<string | null> {
    if (isNative) {
      try {
        const { value } = await Preferences.get({ key })
        if (value !== null) {
          window.localStorage.setItem(key, value)
          return value
        }
      } catch {}
    }
    return this.getSync(key)
  },

  async remove(key: string): Promise<void> {
    try {
      window.localStorage.removeItem(key)
    } catch {}
    if (isNative) {
      await Preferences.remove({ key }).catch(() => {})
    }
  }
}
