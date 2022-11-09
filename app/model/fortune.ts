export type Category = {
  id: string
  name: string
  offensive: boolean
}

export type Fortune = {
  id: string
  text: string
  categories: Array<Category>
}
