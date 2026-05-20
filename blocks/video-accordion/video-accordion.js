// ── Helpers ───────────────────────────────────────────────
const ytId = (url) =>
  url?.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  )?.[1] || null;

const el = (tag, cls) =>
  Object.assign(document.createElement(tag), cls ? { className: cls } : {});

function parseRow(row) {
  const cols = row.children;
  const title = cols[1]?.textContent.trim() || "";
  const clone = cols[2]?.cloneNode(true);
  let id = null;

  for (const a of [...(clone?.querySelectorAll("a") || [])]) {
    id = ytId(a.href) || ytId(a.textContent);
    if (id) {
      const p = a.parentElement;
      (p && p !== clone && p.textContent.trim() === a.textContent.trim()
        ? p
        : a
      ).remove();
      break;
    }
  }
  if (!id) id = ytId(cols[3]?.querySelector("a")?.href || cols[3]?.textContent);
  if (!id)
    for (const c of cols) {
      id = ytId(c?.textContent);
      if (id) break;
    }

  const thumbSrc =
    cols[0]?.querySelector("img")?.src ||
    (id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : "");
  return { title, description: clone?.innerHTML || "", id, thumbSrc };
}

function showPoster(id, title, container, thumbSrc) {
  container.innerHTML = "";
  const poster = el("div", "va-video-poster");
  const img = Object.assign(el("img"), { alt: title });

  img.src = thumbSrc || `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
  if (thumbSrc) {
    img.onerror = () => {
      img.onerror = () => {
        img.onerror = null;
        img.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      };
      img.src = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
    };
  }

  const play = el("div", "va-big-play");
  play.innerHTML = `<svg viewBox="0 0 40 40" width="80" height="80">
  <circle
    cx="20"
    cy="20"
    r="19"
    fill="rgba(0,0,0,0.35)"
  />

  <circle
    cx="20"
    cy="20"
    r="14"
    fill="none"
    stroke="#ffffff"
    stroke-width="2"
  />

<polygon
  points="15,12 30,20 15,28"
  fill="none"
  style="fill:none"
  stroke="#ffffff"
  stroke-width="2"
  stroke-linejoin="round"
/>
</svg>`;

  poster.append(img, play);
  container.appendChild(poster);

  poster.addEventListener("click", (e) => {
    e.stopPropagation();
    container.innerHTML = "";
    const iframe = Object.assign(el("iframe"), {
      src: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`,
      title,
    });
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute(
      "allow",
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
    );
    container.appendChild(iframe);
  });
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(":scope > div")];
  if (!rows.length) return;

  const heroImgEl = rows[0].children[1]?.querySelector("img");
  const heroHTML = rows[0].children[0]?.innerHTML || "";
  const items = rows.slice(1).map(parseRow);

  block.innerHTML = "";
  block.classList.add("va-block");

  const left = el("div", "va-left");
  const list = el("ul", "va-accordion");
  const right = el("div", "va-right");
  const mediaCon = el("div", "va-media-container");

  left.appendChild(list);
  right.appendChild(mediaCon);

  const showHero = () => {
    mediaCon.innerHTML = "";
    if (heroImgEl) mediaCon.appendChild(heroImgEl.cloneNode(true));
  };

  const heroItem = el("li", "va-item va-hero va-active");
  heroItem.innerHTML = `<div class="va-item-header"><span class="va-item-title">${heroHTML}</span><span class="va-chevron"></span></div><div class="va-item-body"></div>`;
  list.appendChild(heroItem);
  showHero();

  items.forEach((item) => {
    const li = el("li", "va-item va-video");
    li.innerHTML = `
    
      <div class="va-thumb">
        ${item.thumbSrc ? `<img src="${item.thumbSrc}" alt="${item.title}">` : ""}
        <span class="va-play-icon"><svg viewBox="0 0 40 40" width="40" height="40">
  <!-- Dark transparent background -->
  <circle
    cx="20"
    cy="20"
    r="19"
    fill="rgba(0,0,0,0.35)"
  />

  <circle
    cx="20"
    cy="20"
    r="14"
    fill="none"
    stroke="#ffffff"
    stroke-width="2"
  />

<polygon
  points="15,12 30,20 15,28"
  fill="none"
  style="fill:none"
  stroke="#ffffff"
  stroke-width="2"
  stroke-linejoin="round"
/>
</svg></span>
      <div class="va-overlay"></div>
        </div>
      <div class="va-item-header">
        <span class="va-item-title">${item.title}</span>
        <span class="va-chevron"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" data-icon-name="chevron-down" class="rwp-icon icon-color-Gray  " viewBox="0 0 32 32">
<path d="M30.48 7.24l-14.48 14.48-14.48-14.48-1.52 1.52 16 16 16-16z"></path>
</svg></span>
      </div>
      <div class="va-item-body">${item.description}</div>`;
    list.appendChild(li);

    li.addEventListener("click", () => {
      const opening = !li.classList.contains("va-active");
      list
        .querySelectorAll(".va-item.va-video")
        .forEach((v) => v.classList.remove("va-active"));

      if (opening) {
        li.classList.add("va-active");
        heroItem.classList.remove("va-active");
        item.id
          ? showPoster(item.id, item.title, mediaCon, item.thumbSrc)
          : (() => {
              mediaCon.innerHTML = `<img src="${item.thumbSrc}" alt="${item.title}">`;
            })();
      } else {
        heroItem.classList.add("va-active");
        showHero();
      }
    });
  });

  block.append(left, right);
}
