'use strict';class NewsPosts{constructor(){this.apiURI='https://hacker-news.firebaseio.com/v0/',this.firstPageLoadLimit=30,this.loadMoreLoadLimit=30,this.allPosts=null,this.genPost=null}async init(){this.allPosts=JSON.parse((await this.getTop500())),this.genPost=NewsPosts.postList(this.allPosts)}getTop500(){return new Promise((a,b)=>{const c=new XMLHttpRequest;c.onload=()=>a(c.responseText),c.onerror=()=>b(c.statusText),c.open('GET',`${this.apiURI}topstories.json`),c.send()})}getPostData(a){return new Promise((b,c)=>{const d=new XMLHttpRequest;d.onload=()=>b(d.responseText),d.onerror=()=>c(d.statusText),d.open('GET',`${this.apiURI}item/${a}.json`),d.send()})}static formatLayout(a,b){return`
      <hr>
      <p>
        <a href="${b}">${a}</a> <span class="source">(${b?b.match(/:\/\/(.[^/]+)/)[1]:''})</span>
      </p>
    `}static*postList(a){for(;0<a.length;)yield a[0],a=a.removeElement(0)}}