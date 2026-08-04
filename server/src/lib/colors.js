export const avatarPalette = ['#6366f1', '#06b6d4', '#f97316', '#22c55e', '#eab308', '#ec4899', '#8b5cf6', '#0ea5e9']

export function nextColor(existingCount) {
  return avatarPalette[existingCount % avatarPalette.length]
}
