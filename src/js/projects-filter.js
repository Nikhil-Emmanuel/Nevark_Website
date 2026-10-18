/* Nevark — industry filter on /projects. Without JS all projects stay visible and the chips stay hidden. */
(function () {
  const group = document.querySelector("[data-filter-group]");
  const list = document.querySelector("[data-filter-list]");
  const status = document.querySelector("[data-filter-status]");
  if (!group || !list) return;

  const buttons = [...group.querySelectorAll("[data-filter]")];
  const cards = [...list.querySelectorAll("[data-industry]")];
  group.hidden = false;

  function apply(filter) {
    let shown = 0;
    cards.forEach((card) => {
      const match = filter === "all" || card.dataset.industry === filter;
      card.hidden = !match;
      if (match) { shown++; card.classList.add("in-view"); }
    });
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === filter)));
    if (status) status.textContent = filter === "all" ? "" : `Showing ${shown} of ${cards.length} projects`;
    const url = new URL(location.href);
    if (filter === "all") url.searchParams.delete("industry"); else url.searchParams.set("industry", filter);
    history.replaceState(null, "", url);
  }

  buttons.forEach((b) => b.addEventListener("click", () => apply(b.dataset.filter)));
  const initial = new URLSearchParams(location.search).get("industry");
  if (initial && buttons.some((b) => b.dataset.filter === initial)) apply(initial);
})();
