// Native smooth scrolling; target sections use scroll-mt-* to clear the sticky header.
export function scrollToHash(hash) {
  document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// onClick helper for in-page anchors
export const anchorClick = (hash) => (e) => {
  e.preventDefault();
  scrollToHash(hash);
};
