// Setup mobile navigation menu
document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("nav-toggle")

  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded")
    navToggle.setAttribute("aria-expanded", !(expanded === "true"))
  })
})
