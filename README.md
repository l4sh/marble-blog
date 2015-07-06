# MARBLE
## a dynamic MARkdown BLog Engine

## What is this thing about?

This is a small blog engine designed to be able to run completely
on the frontend without needing any kind of server side processing.

The goals of this project are as follow

- Single page app or at least most of it
- Posts must be written in markdown and preferably compatible with Jekyll
  or a similar blog engine.
- No server side processing required, only configuration tasks 
- No static html generation required before upload (or at least minimum)

## How does it work?

A list of the posts in JSON format is loaded, then the posts are
downloaded using AJAX and rendered on the client.

If the client doesn't have javascript active a link to the posts page
is loaded.

## Installation
  
Make sure you have installed node, gulp and bower (you can do everything
by hand if you know how but it's easier this way).

  `git clone https://github.com/l4sh/marble-blog marble.git`

  `cd marble`

  `npm install && bower install`

  `./marble setup`
