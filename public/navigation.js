const navigations = document.querySelectorAll(
  "[data-mobile-navigation], [data-nav-group]",
)

for (const navigation of navigations) {
  if (!(navigation instanceof HTMLDetailsElement)) continue

  const trigger = navigation.querySelector("summary")
  const panelId = trigger?.getAttribute("aria-controls")
  const panel = panelId ? document.getElementById(panelId) : null

  if (!(trigger instanceof HTMLElement) || !(panel instanceof HTMLElement)) {
    continue
  }

  const closeNavigation = (restoreFocus = false) => {
    navigation.open = false

    if (restoreFocus) {
      trigger.focus()
    }
  }

  navigation.addEventListener("toggle", () => {
    if (navigation.open) return

    for (const child of navigation.querySelectorAll(
      "details[data-nav-group]",
    )) {
      child.open = false
    }
  })

  navigation.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !navigation.open) return

    event.preventDefault()
    event.stopPropagation()
    closeNavigation(true)
  })

  panel.addEventListener("click", (event) => {
    const target = event.target

    if (target instanceof Element && target.closest("a")) {
      closeNavigation()
    }
  })

  document.addEventListener("pointerdown", (event) => {
    const target = event.target

    if (
      navigation.open &&
      target instanceof Node &&
      !navigation.contains(target)
    ) {
      closeNavigation()
    }
  })

  window.addEventListener("pageshow", () => {
    closeNavigation()
  })
}
