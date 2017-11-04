'use strict';

const apiURI = 'https://hacker-news.firebaseio.com/v0/';

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

function* getPost() {
  while (topPosts.length > 0) {
    yield topPosts[0];
    topPosts = topPosts.removeElement(0);
  }
}

let posts = getPost();

setTop().then(() => {
  for (let i = 0; i < 10; i++) {
    console.log(posts.next().value);
  }
});
