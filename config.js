var config = {
  author: {
    name: 'MARBLE Author',
    description: 'I post things, a lot of things',
    email: '', // optional
    twitterHandle: '@my_twitter_handle',
    twitter: 'https://twitter.com/twitter',
    soundcloud: 'https://soundcloud.com/l4sh',
    facebook: 'https://facebook.com/l4sh'

  },

  blog: {
    title: 'My MARBLE blog',
    subtitle: 'A MARkdown dynamic BLog Engine',
    description: 'This is a blog running MARBLE, if you are the author of this blog you might want to update this information.',
    license: 'All rights reserved 2015',
    url: 'https://github.com/l4sh/marble-blog',
    lang: 'en',
    postsPerPage: 5,
    pagerPosition: 'bottom',
    postsJSON: 'posts.json',
    excerptLength: 50,
    postsFolder: 'posts',
    draftsFolder: '_drafts',
    publishedFolder: '_posts',
    templatesFolder: '_templates',
    atomFile: 'feed.atom',
    rssFile: 'feed.rss'
  },

  editor: 'vim'
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
}
