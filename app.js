const header = document.querySelector(".site-header");
const toggle = document.querySelector(".nav-toggle");

if (toggle && header) {
  toggle.addEventListener("click", () => {
    const open = header.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}
