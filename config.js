var config = {
  author: {
    name: 'Marble Man',
    description: 'I post about a lot of things',
    email: 'email@example.com', // optional
    twitter: 'https://twitter.com/twitter',
    twitterHandle: '@twitter',
    facebook: 'https://facebook.com/facebook'
  },

  blog: {
    title: 'My MARBLE blog',
    subtitle: 'This is my new blog',
    description: 'This is a blog running MARBLE, if you are the author of this blog you might want to update this information.',
    url: 'https://github.com/l4sh/marble-blog',
    lang: 'en',
    postsPerPage: 5,
    pagerPosition: 'bottom', // can be 'top', 'bottom' or 'both'
    pagerStyle: 'icons', // can be 'icons' or 'text'
    postsJSON: 'posts.json',
    excerptLength: 50,
    excerptThreshold: 10, // If the post description has less characters than this an excerpt will be generated
    postsFolder: 'posts', // Static html posts folder
    draftsFolder: '_drafts',
    publishedFolder: '_posts',
    templatesFolder: 'core/templates',
    atomFile: 'feed.atom',
    rssFile: 'feed.rss'
  },

  editor: 'vim',

  layout: {
    columns: {
      amount: 2,
      sizes: [9, 3], // Total must be 12
      main: 1
    },
    extraRows: 'none', // 'top', 'bottom', 'both', 'none'
    footer: {
      poweredBy: true, // Show "Powered by MARBLE" text
      licenseText: 'Copyright © {{author}} {{year}} - All rights reserved'
    }
  },

  plugins: {
    example: {
      enabled: false,
      area: '#element-id'
    },
    authorInfo: {
      enabled: true,
      area: '#col-2',
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
}
