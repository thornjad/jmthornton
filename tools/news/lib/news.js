'use strict';

const disallowDomains = [
  'medium.com',
];

class NewsPosts {
  apiURI = 'https://hacker-news.firebaseio.com/v0/';
  loadLimit = 30;
  allPosts = null;
  genPost = null;
  loadedPosts = [];

  async init() {
    this.allPosts = JSON.parse((await this.getTop500()));
    this.genPost = NewsPosts.postList(this.allPosts);
  }

  async getTop500() {
    const res = await fetch(`${this.apiURI}topstories.json`);
    return await res.text();
  }

  async getPostData(id) {
    const res = await fetch(`${this.apiURI}item/${id}.json`);
    return await res.text();
  }

  recordPosted(story) {
    this.loadedPosts.push(story);
  }

  static formatLayout(title, url, id) {
    const urlMatcher = /:\/\/(?:www\.)?(.[^/]+)/;
    const pocketUrl = `https://getpocket.com/save?url=${url}`;
    const commentsUrl = `https://news.ycombinator.com/item?id=${id}`
    return `<hr><p>
      <a href="${url}">${title}</a>
      <br />
      <span class="source">${url ? url.match(urlMatcher)[1] : ''}</span>
      &nbsp;<a class="extra-content-link" href="${pocketUrl}" target="_blank" rel="noopener noreferrer">add to pocket</a>
      &nbsp;<a class="extra-content-link" href="${commentsUrl} target="_blank" rel="noopener noreferrer">comments</a>
    </p>`;
  }

  static *postList(lists) {
    while (lists.length) yield lists.shift();
  }
}

const run = async (posts) => {
  try {
    await posts.init();
    await loadSomePosts(posts);
  } catch (e) {
    console.error(e);
    alert('An error occured. Please try again later');
  }
};

const loadSomePosts = async (posts) => {
  showSpinner();
  try {
    const list = await loadPosts(posts.loadLimit, posts);
    for (let story of list) {
      story = JSON.parse(story) ?? {};
      const shortUrlMatch = (story.url ?? '').match(/:\/\/(?:www\.)?(.[^/]+)/);
      if (story.url && shortUrlMatch.length & 2
          && !disallowDomains.includes(shortUrlMatch[1])) {
        injectPost(story.title, story.url, story.id);
        posts.recordPosted(story);
      } else {
        continue;
      }
    }
  } finally {
    hideSpinner();
    showFooter();
  }
};

const hideSpinner = () => {
  document.getElementById('spinner').style.display = 'none';
};

const showSpinner = () => {
  document.getElementById('spinner').style.display = 'block';
};

const showFooter = () => {
  document.getElementById('footer').style.display = 'block';
};

const loadPosts = async (numPostsToLoad, posts) => {
  let firstPostsFuture = [];

  for (let i = 0; i < numPostsToLoad; i++) {
    firstPostsFuture.push(posts.getPostData(posts.genPost.next().value));
  }
  const firstPostsList = await Promise.all(firstPostsFuture);
  return firstPostsList;
};

const injectPost = (title, url, id) => {
  const layout = NewsPosts.formatLayout(title, url, id);
  const div = document.createElement('div');
  div.className = 'post';
  div.innerHTML = layout;
  const main = document.querySelector('main.content');
  if (main) {
    main.append(div);
  }
};

const addUpdatedMessage = () => {
  const msg = document.querySelector('h6.updated-message');
  window.newsUpdateTime = Date.now();
  msg.innerText = 'Last updated now';

  window.newsUpdateTimer = setInterval(() => {
    const timeNow = Date.now();
    const timeSince = (timeNow - window.newsUpdateTime) / 60000;
    if (timeSince < 60) {
      const unit = timeSince === 1 ? 'minute' : 'minutes';
      msg.innerText = `Last updated ${timeSince | 0} ${unit} ago`;
    } else {
      clearInterval(window.newsUpdateTimer);
      msg.innerText = `Last updated 1 hour ago`;
      window.newsUpdateTimer = setInterval(() => {
        const timeNow = Date.now();
        const timeSince = (timeNow - window.newsUpdateTime) / 3600000;
        const unit = timeSince === 1 ? 'hour' : 'hours';
        msg.innerText = `Last updated ${timeSince | 0} ${unit} ago`;
      });
    }
  }, 300000);
};

const saveToPocket = (url) => {
  const pocketUrl = `https://getpocket.com/save?url=${url}`;
  window.open(pocketUrl, '_blank');
};

const main = () => {
	const posts = new NewsPosts();
	document.addEventListener('DOMContentLoaded', run.bind(null, posts));
	document.addEventListener('scroll', evt => {
		if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
			loadSomePosts(posts);
		}
	});
	addUpdatedMessage();
  document.querySelector('button.open-all').addEventListener('click', () => {
    posts.loadedPosts.forEach((p) => window.open(p.url, '_blank'));
  });
};

// run script
main();
