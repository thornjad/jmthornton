'use strict';

class NewsPosts {
  constructor() {
    this.apiURI = 'https://hacker-news.firebaseio.com/v0/';
    this.firstPageLoadLimit = 30;
    this.loadMoreLoadLimit = 30;
    this.allPosts = null;
    this.genPost = null;
  }

  async init() {
    this.allPosts = JSON.parse(await this.getTop500());
    this.genPost = NewsPosts.postList(this.allPosts);
  }

  getTop500() {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = (data) => resolve(xhr.responseText);
      xhr.onerror = (e) => reject(xhr.errorText);
      xhr.open('GET', `${this.apiURI}topstories.json`);
      xhr.send();
    });
  }

  getPostData(id) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = (data) => resolve(xhr.responseText);
      xhr.onerror = (e) => reject(xhr.errorText);
      xhr.open('GET', `${this.apiURI}item/${id}.json`);
      xhr.send();
    });
  }

  static formatLayout(title, url) {
    return `
      <hr>
      <p>
        <a href="${url}">${title}</a> <span class="source">(${url.match(/:\/\/(.[^/]+)/)[1]})</span>
      </p>
    `;
  }

  static * postList(lists) {
    while (lists.length > 0) {
      yield lists[0];
      lists = lists.removeElement(0);
    }
  }
}
