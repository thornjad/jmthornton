'use strict';

const apiURI = 'https://hacker-news.firebaseio.com/v0/';
const firstPageLoadLimit = 30;

let topPosts = [];

const formatLayout = (title, url, source) => {
  return `
  <div class="post">
    <hr>
    <p>
      <a href="${url}">${title}</a>, (${source})
    </p>
  </div>
  `;
}

async function setTop() {
  topPosts = JSON.parse(await getTop500());
}

const getTop500 = () => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = (data) => resolve(xhr.responseText);
    xhr.onerror = (e) => reject(xhr.errorText);
    xhr.open('GET', `${apiURI}topstories.json`);
    xhr.send();
  });
}

function* getPostList() {
  while (topPosts.length > 0) {
    yield topPosts[0];
    topPosts = topPosts.removeElement(0);
  }
}

const getPostData = (id) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = (data) => resolve(xhr.responseText);
    xhr.onerror = (e) => reject(xhr.errorText);
    xhr.open('GET', `${apiURI}item/${id}.json`);
    xhr.send();
  });
}

async function loadFirst() {
  let posts = getPostList();
  let firstPostsFuture = [];

  await setTop();
  for (let i = 0; i < firstPageLoadLimit; i++) {
    firstPostsFuture.push(getPostData(posts.next().value));
  }
  const firstPostsList = await Promise.all(firstPostsFuture);
  for (let post of firstPostsList) {
    post = JSON.parse(post);
    console.log(post.title);
  }
}
