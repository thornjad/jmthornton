"""News functions."""

import requests


API_URL = "https://hacker-news.firebaseio.com/v0"
TOP_POSTS = f"{API_URL}/topstories.json"
POST_DETAILS = f"{API_URL}/item/{{}}.json"
DISALLOWED_DOMAINS = ["medium.com"]
LOAD_LIMIT = 50
POCKET_URL = "https://getpocket.com/save?url={}"
COMMENTS_URL = "https://news.ycombinator.com/item?id={}"


def get_news_posts():
    """Get news posts."""
    all_posts_ids = fetch_top_post_ids()
    if not all_posts_ids:
        return []
    posts = get_all_posts_details(all_posts_ids)
    return posts


def fetch_top_post_ids():
    """Get top stories from API."""
    # TODO cache
    top_posts = requests.get(TOP_POSTS)
    if top_posts.status_code != 200:
        return None
    return top_posts.json()


def get_all_posts_details(post_ids):
    """Get posts details."""
    posts = []
    # TODO async
    for post_id in post_ids:
        res = requests.get(POST_DETAILS.format(post_id))
        if res.status_code != 200:
            continue
        post = res.json()
        if is_acceptable(post):
            post = add_metadata(post)
            posts.append(post)
        if len(posts) >= LOAD_LIMIT:
            break

    return posts


def is_acceptable(post):
    """Check if post is acceptable."""
    if not post.get("url") or any(
        domain in post["url"] for domain in DISALLOWED_DOMAINS
    ):
        return False
    return "title" in post and "id" in post


def add_metadata(post):
    """Add metadata."""
    post["source"] = post["url"].split("/")[2]
    post["pocket_url"] = POCKET_URL.format(post["url"])
    post["comments_url"] = COMMENTS_URL.format(post["id"])
    return post
