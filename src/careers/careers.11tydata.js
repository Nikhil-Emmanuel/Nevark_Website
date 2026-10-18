export default {
  layout: "layouts/job.njk",
  permalink: (data) => (data.draft ? false : `/careers/${data.page.fileSlug}/`),
  scripts: ["/js/forms.js"],
  eleventyComputed: {
    eleventyExcludeFromCollections: (data) => Boolean(data.draft),
    breadcrumbs: (data) => [
      { name: "Home", url: "/" },
      { name: "Careers", url: "/careers" },
      { name: data.title, url: data.page.url },
    ],
  },
};
