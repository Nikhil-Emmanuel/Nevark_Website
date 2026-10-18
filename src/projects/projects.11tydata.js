export default {
  layout: "layouts/case-study.njk",
  permalink: "/projects/{{ page.fileSlug }}/",
  ogType: "article",
  eleventyComputed: {
    ogImage: (data) => data.ogImage || data.cover,
    breadcrumbs: (data) => [
      { name: "Home", url: "/" },
      { name: "Projects", url: "/projects" },
      { name: data.title, url: data.page.url },
    ],
  },
};
