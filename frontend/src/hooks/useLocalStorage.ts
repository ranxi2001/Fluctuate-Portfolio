import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
        // Dispatch a custom event to sync across hooks in the same window
        window.dispatchEvent(new Event('local-storage'))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
        // Dispatch a custom event to sync across hooks in the same window
        window.dispatchEvent(new Event('local-storage'))
      }
      setStoredValue(initialValue)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        try {
          const item = window.localStorage.getItem(key)
          if (item) {
            setStoredValue(JSON.parse(item))
          } else {
            setStoredValue(initialValue)
          }
        } catch (error) {
          console.error(`Error parsing storage change for key "${key}":`, error)
        }
      }
    }

    // Listen for both cross-tab (storage) and same-tab (local-storage) events
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('local-storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('local-storage', handleStorageChange)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue] as const
}
