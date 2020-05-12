'use strict';

class NewsPosts {
  apiURI = 'https://hacker-news.firebaseio.com/v0/';
  firstPageLoadLimit = 30;
  loadMoreLoadLimit = 30;
  allPosts = null;
  genPost = null;

  async init() {
    this.allPosts = JSON.parse((await this.getTop500()));
    this.genPost = NewsPosts.postList(this.allPosts);
  }

  getTop500() {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = data => resolve(xhr.responseText);
      xhr.onerror = e => reject(xhr.statusText);
      xhr.open('GET', `${this.apiURI}topstories.json`);
      xhr.send();
    });
  }

  getPostData(id) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = data => resolve(xhr.responseText);
      xhr.onerror = e => reject(xhr.statusText);
      xhr.open('GET', `${this.apiURI}item/${id}.json`);
      xhr.send();
    });
  }

  static formatLayout(title, url) {
    return `
      <hr>
      <p>
        <a href="${url}">${title}</a> <span class="source">(${url ? url.match(/:\/\/(.[^/]+)/)[1] : ''})</span>
      </p>
    `;
  }

  static *postList(lists) {
    while (lists.length > 0) {
      yield lists[0];
      lists = lists.removeElement(0);
    }
  }
}

const run = async (posts) => {
  try {
    await posts.init();
    await loadFirst(posts);
  } catch (e) {
    console.error(e);
    alert('An error occured. Please try again later');
  }
};

const loadFirst = async (posts) => {
  try {
    const list = await loadPosts(posts.firstPageLoadLimit, posts);
    for (let story of list) {
      story = JSON.parse(story) ?? {};
      if (story.url) {
        injectPost(story.title, story.url);
      } else {
        continue;
      }
    }
  } finally {
    hideSpinner();
    showFooter();
  }
};

const loadMore = async (posts) => {
  try {
    showSpinner();
    const list = await loadPosts(posts.loadMoreLoadLimit, posts);
    for (let story of list) {
      story = JSON.parse(story);
      if (story.url) {
        injectPost(story.title, story.url);
      } else {
        continue;
      }
    }
  } finally {
    hideSpinner();
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

const injectPost = (title, url) => {
  const layout = NewsPosts.formatLayout(title, url);
  const div = document.createElement('div');
  div.className = 'post';
  div.innerHTML = layout;
  const main = document.querySelector('main.content');
  if (main) {
    main.append(div);
  }
};

const addUpdatedMessage = () => {
  const msg = document.createElement('h6');
  window.newsUpdateTime = Date.now();
  msg.className = 'updated-message';
  msg.innerText = 'Last updated now';
  const main = document.querySelector('main.content');
  if (main) {
    main.prepend(msg);
  }
  window.newsUpdateTimer = setInterval(() => {
    let timeNow = Date.now();
    let timeSince = (timeNow - window.newsUpdateTime) / 60000;
    if (timeSince < 60) {
      msg.innerText = `Last updated ${timeSince | 0} minutes ago`;
    } else {
      clearInterval(window.newsUpdateTimer);
      msg.innerText = `Last updated 1 hour ago`;
      window.newsUpdateTimer = setInterval(() => {
        let timeNow = Date.now();
        let timeSince = (timeNow - window.newsUpdateTime) / 3600000;
        msg.innerText = `Last updated ${timeSince | 0} hours ago`;
      });
    }
  }, 300000);
};

const main = () => {
	const posts = new NewsPosts();
	document.addEventListener('DOMContentLoaded', run.bind(null, posts));
	document.addEventListener('scroll', evt => {
		if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
			loadMore(posts);
		}
	});
	addUpdatedMessage();
};

// run script
main();
