export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  cmd?: boolean
  shift?: boolean
  alt?: boolean
  description: string
  action: () => void
  global?: boolean // If false, only works when not in input/textarea
}
