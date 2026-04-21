import { useState, useEffect } from 'react'

export function useCooldown(lastActionTime: number | null, cooldownSeconds: number = 120, isActive: boolean = true) {
  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    if (!isActive || !lastActionTime) {
      setTimeLeft(0)
      return
    }

    const checkCooldown = () => {
      const now = Date.now()
      const diff = Math.floor((now - lastActionTime) / 1000)

      if (diff < cooldownSeconds) {
        setTimeLeft(cooldownSeconds - diff)
      } else {
        setTimeLeft(0)
      }
    }

    checkCooldown()
    const interval = setInterval(checkCooldown, 1000)
    return () => clearInterval(interval)
  }, [lastActionTime, cooldownSeconds, isActive])

  return timeLeft
}