import { redirect } from "@remix-run/node"

export const loader = () => redirect("/services", 301)

export default function ContactRedirect() {
  return null
}
