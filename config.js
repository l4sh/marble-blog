var config = {
  author: {
    name: 'MARBLE Author',
    description: 'I post things, a lot of things',
    email: 'email@example.com', // optional
    twitter: 'https://twitter.com/twitter',
    twitterHandle: '@twitter',
    facebook: 'https://facebook.com/facebook'
  },

  blog: {
    title: 'My MARBLE blog',
    subtitle: 'A MARkdown dynamic BLog Engine',
    description: 'This is a blog running MARBLE, if you are the author of this blog you might want to update this information.',
    license: 'All rights reserved 2015',
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
    columns: 1,
    columnSize: [],
    footer: true,
  },

  plugins: {
    example: {
      enabled: false,
      area: '#widget-unit'
    },
    authorInfo: {
      enabled: false,
      area: '#right-sidebar',
      position: 1,
      hiddenOnMobile: true
    }
  }

};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
}
