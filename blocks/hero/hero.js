export default function decorate(block) {
  const heroContent = block.firstElementChild;
  if (heroContent) {
    heroContent.classList.add("hero-content");
  }
  const sibling = heroContent.nextElementSibling;
  if (sibling) {
    sibling.classList.add("hero-text");
  }
  const cols = [...block.firstElementChild.children];
  cols.forEach((col) => {
    col.classList.add("hero-col");
  });

  const imgs = block.querySelectorAll("img");
  imgs.forEach((img) => {
    img.setAttribute("loading", "eager");
    img.setAttribute("fetchpriority", "high");
  });

  const pictures = block.querySelectorAll("picture");
  pictures.forEach((pic) => {
    pic.classList.add("hero-picture");
  });
}
