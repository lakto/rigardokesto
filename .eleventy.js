const eleventyPluginFilesMinifier = require("@sherby/eleventy-plugin-files-minifier");
const lazyImagesPlugin = require('eleventy-plugin-lazyimages');

if (process.env.NODE_ENV?.toLocaleLowerCase() !== "production") require("dotenv").config();

module.exports = function(eleventyConfig) {

  // minifier js
  eleventyConfig.addTransform("minify", require("./scripts/minify"));
  
  // lazyImages and Files Minifier
  eleventyConfig.addPlugin(lazyImagesPlugin, {
    appendInitScript: false, // Menonaktifkan penyertaan otomatis script lazysizes dari CDN
  });
  eleventyConfig.addPlugin(eleventyPluginFilesMinifier);

  // Tailwind config target watch
  eleventyConfig.addWatchTarget("tailwind.config.js");

  // Global data for root
  eleventyConfig.addGlobalData("rootTitle", "Milchkannen");
  eleventyConfig.addGlobalData("rootURL", "https://blog.milchkannen.ch");
  eleventyConfig.addGlobalData("SUPABASE_URL", process.env.SUPABASE_URL);
  eleventyConfig.addGlobalData("SUPABASE_KEY", process.env.SUPABASE_KEY);
  eleventyConfig.addGlobalData("quotes", "<i>Web developer, digital archivist, design enthusiast, furniture builder, seamstress, and photographer. Embracing creativity in every aspect of life.</i><br />&mdash;<br /><b> This is Kilchenmann aka Milchkannen</b>")

  // Bypass dir
  const passthroughCopies = ["src/robots.txt", "src/asset/", "src/CNAME"];
  passthroughCopies.forEach(path => eleventyConfig.addPassthroughCopy(path));

  // Custom collection
  const collectionConfigs = [
    { name: "posts", glob: "src/blog/**/*.md" },
    { name: "photos", glob: "src/photos/**/*.md" },
    // { name: "code", glob: "src/code/**/*.md" },
    { name: "recentPosts", glob: "src/blog/*.md", limit: 3 },
    { name: "recentPhotos", glob: "src/photos/*.md", limit: 6 },
    // { name: "recentCode", glob: "src/code/*.md", limit: 3 }
  ];

  // Loop custom collection
  collectionConfigs.forEach(config => {
    eleventyConfig.addCollection(config.name, function(collectionApi) {
      let items = collectionApi.getFilteredByGlob(config.glob);
      return config.limit ? items.reverse().slice(0, config.limit) : items;
    });
  });

  // Tags collection for blog and photos
  ["blog", "photos"].forEach(type => {
    eleventyConfig.addCollection(`${type}Tags`, getTags(type));
  });

  // Filter to get first image array cover
  eleventyConfig.addFilter("firstCoverImage", function(cover) {
    if (Array.isArray(cover) && cover.length > 0) {
      return cover[0].url;
    }
    return cover;
  });

  // Filter to limit words string
  eleventyConfig.addLiquidFilter("limitWords", function(str, wordLimit) {
    let words = str.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return str;
  });
  
  /**
   * Get tag from collection
   * @param {'blog'|'photos'} type - Collection type (blog or photos)
   * @returns {Array} - Array uniq tags
   */
  function getTags(type) {
    return (collection) => {
      let tagsSet = new Set();
      collection.getAll().forEach((item) => {
        if (item.filePathStem.includes(`/${type}/`) && item.data.tags) {
          item.data.tags.forEach((tag) => {
            tagsSet.add(tag);
          });
        }
      });
      return Array.from(tagsSet);
    };
  }

  // Input output dir
  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};
