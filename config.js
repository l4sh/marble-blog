var config = {
  author: {
    name: 'MARBLE Author',
    description: 'I post things, a lot of things',
    twitterHandle: '@my_twitter_handle',
    twitter: 'https://twitter.com/twitter'
  },

  blog: {
    title: 'My MARBLE blog',
    subtitle: 'A MARkdown dynamic BLog Engine',
    description: 'This is a blog running MARBLE, if you are the author of this blog you might want to update this information.',
    url: 'https://github.com/l4sh/marble-blog',
    lang: 'en',
    postsPerPage: 5,
    pagerPosition: 'bottom',
    postsJSON: 'posts.json',
    excerptLength: 50,
    postsFolder: 'posts',
    draftsFolder: '_drafts',
    publishedFolder: '_posts',
    templatesFolder: '_templates'
  },

  editor: 'vim'
};

module.exports = config
