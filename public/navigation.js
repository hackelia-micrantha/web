const mobileNavigations = document.querySelectorAll(
  "[data-mobile-navigation]",
)

for (const navigation of mobileNavigations) {
  if (!(navigation instanceof HTMLDetailsElement)) continue

  const trigger = navigation.querySelector("summary")
  const panelId = trigger?.getAttribute("aria-controls")
  const panel = panelId ? document.getElementById(panelId) : null

  if (!(trigger instanceof HTMLElement) || !(panel instanceof HTMLElement)) {
    continue
  }

  const syncExpandedState = () => {
    trigger.setAttribute("aria-expanded", String(navigation.open))
  }

  const closeNavigation = (restoreFocus = false) => {
    navigation.open = false
    syncExpandedState()

    if (restoreFocus) {
      trigger.focus()
    }
  }

  navigation.addEventListener("toggle", syncExpandedState)

  navigation.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !navigation.open) return

    event.preventDefault()
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

  syncExpandedState()
}
