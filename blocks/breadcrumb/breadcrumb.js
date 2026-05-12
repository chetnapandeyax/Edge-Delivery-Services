export default function decorate(block) {
  const nav = document.createElement("nav");
  nav.setAttribute("aria-label", "breadcrumb");

  const ol = document.createElement("ol");
  ol.classList.add("breadcrumb-list");

  const isHomePage = window.location.pathname === "/";
  const rows = [...block.children];

  rows.forEach((row, index) => {
    const cols = [...row.children];
    const label = cols[0]?.textContent?.trim();
    const href = cols[1]?.textContent?.trim();

    if (!label) return;

    // ⚡ On home page, only show the first item (Home)
    if (isHomePage && index > 0) return;

    const li = document.createElement("li");
    li.classList.add("breadcrumb-item");

    if (index === rows.length - 1 || isHomePage) {
      // Last item OR home page = current page (no link)
      li.classList.add("active");
      li.setAttribute("aria-current", "page");
      li.textContent = label;
    } else {
      const a = document.createElement("a");
      a.href = href || "/";
      a.textContent = label;
      li.appendChild(a);
    }

    ol.appendChild(li);
  });

  nav.appendChild(ol);
  block.textContent = "";
  block.appendChild(nav);
}
