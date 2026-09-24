export function getCountdown(target: string | Date): string {
  const targetDate = new Date(target)
  const now = new Date()
  const diffMs = targetDate.getTime() - now.getTime()

  if (diffMs <= 0) return "Started"

  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `in ${diffMins} min${diffMins !== 1 ? "s" : ""}`
  if (diffHours < 24) return `in ${diffHours} hr${diffHours !== 1 ? "s" : ""}`
  if (diffDays < 7) return `in ${diffDays} day${diffDays !== 1 ? "s" : ""}`

  return targetDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export function groupEventsByPeriod<T extends { start_date: string }>(events: T[]) {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfTomorrow = new Date(startOfToday)
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1)
  const endOfTomorrow = new Date(startOfTomorrow)
  endOfTomorrow.setDate(endOfTomorrow.getDate() + 1)
  const endOfThisWeek = new Date(startOfToday)
  endOfThisWeek.setDate(endOfThisWeek.getDate() + (7 - startOfToday.getDay()))
  const endOfNextWeek = new Date(endOfThisWeek)
  endOfNextWeek.setDate(endOfNextWeek.getDate() + 7)

  const groups: Record<string, T[]> = {}
  const order: string[] = []
  let pastEvents: T[] = []

  function addTo(key: string, event: T) {
    if (!groups[key]) {
      groups[key] = []
      order.push(key)
    }
    groups[key].push(event)
  }

  for (const event of events) {
    const eventDate = new Date(event.start_date)

    if (eventDate < startOfToday) {
      pastEvents.push(event)
    } else if (eventDate < startOfTomorrow) {
      addTo("Today", event)
    } else if (eventDate < endOfTomorrow) {
      addTo("Tomorrow", event)
    } else if (eventDate <= endOfThisWeek) {
      addTo("This Week", event)
    } else if (eventDate <= endOfNextWeek) {
      addTo("Next Week", event)
    } else {
      const label = eventDate.toLocaleDateString(undefined, {
        month: "long",
        year: eventDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      })
      addTo(label, event)
    }
  }

  if (pastEvents.length > 0) {
    groups["Past Events"] = pastEvents
    order.push("Past Events")
  }

  return { groups, order }
}