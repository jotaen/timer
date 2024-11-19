export type Item = Activity | Loop

export type Activity = {
  kind: "ACTIVITY"
  title: string
  duration: number
  skipLast: boolean
}

export type Loop = {
  kind: "LOOP"
  repeat: number
  activities: Activity[]
}

export type Program = {
  title: string
  items: Item[]
}
