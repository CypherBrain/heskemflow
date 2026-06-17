export function serializePrisma<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value) => {
      if (value && typeof value === "object" && typeof value.toNumber === "function") {
        return value.toNumber()
      }

      if (value instanceof Date) {
        return value.toISOString()
      }

      return value
    })
  )
}
