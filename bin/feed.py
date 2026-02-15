#!/usr/bin/env python3

from datetime import datetime, timezone, timedelta, time
from bs4 import BeautifulSoup
from feedgen.feed import FeedGenerator
from pathlib import Path

# Define Central Time zone offset
CENTRAL_TZ = timezone(timedelta(hours=-6))  # CST is UTC-6


def parse_date_to_9am_cst(date_str=None, fallback_timestamp=None):
    """
    Parse a date string or timestamp into a datetime at 9:00 AM CST.
    If date_str is None, uses fallback_timestamp.
    If both are None, returns None.
    """
    if date_str:
        try:
            dt = datetime.strptime(date_str, '%Y-%m-%d').replace(tzinfo=CENTRAL_TZ)
            return dt.replace(hour=9, minute=0, second=0, microsecond=0)
        except ValueError:
            pass

    if fallback_timestamp is not None:
        dt = datetime.fromtimestamp(fallback_timestamp, tz=CENTRAL_TZ)
        return dt.replace(hour=9, minute=0, second=0, microsecond=0)

    return None


def parse_astro_file(file_path):
    import re

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract BlogPost props using regex
    blogpost_match = re.search(r'<BlogPost\s+(.*?)>', content, re.DOTALL)
    if not blogpost_match:
        return None

    props_str = blogpost_match.group(1)

    # Extract individual props
    def extract_prop(name):
        # Match both title="value" and title={value}
        match = re.search(rf'{name}=(?:"([^"]*)"|{{([^}}]*)\}})', props_str)
        if match:
            return match.group(1) or match.group(2)
        return None

    title = extract_prop('title')
    description = extract_prop('description') or ''
    slug = extract_prop('slug')
    published_date_str = extract_prop('publishedDate')
    modified_date_str = extract_prop('modifiedDate')

    if not title or not slug:
        return None

    # Parse dates
    published_date = parse_date_to_9am_cst(published_date_str) if published_date_str else None
    modified_date = parse_date_to_9am_cst(modified_date_str) if modified_date_str else published_date

    if not published_date:
        published_date = parse_date_to_9am_cst(fallback_timestamp=file_path.stat().st_mtime)
    if not modified_date:
        modified_date = published_date

    # Extract content after BlogPost tag
    soup = BeautifulSoup(content, 'html.parser')
    blog_body = soup.find('div', class_='blog-body')
    if blog_body:
        content_html = str(blog_body)
    else:
        content_html = description

    url = f'https://jmthornton.net/blog/p/{slug}'

    return {
        'title': title,
        'published_date': published_date,
        'modified_date': modified_date,
        'description': description,
        'content': content_html,
        'url': url,
        'id': url,
    }


def main():
    # Initialize feed generator
    fg = FeedGenerator()
    fg.title('Blog by Jade Michael Thornton')
    fg.link(href='https://jmthornton.net/blog/feed.xml', rel='self')
    fg.link(href='https://jmthornton.net/blog/', rel='alternate', type='text/html')
    fg.id('https://jmthornton.net/blog/')
    fg.language('en-US')
    fg.author({'name': 'Jade Michael Thornton'})

    # Get all Astro files from source
    blog_dir = Path('src/pages/blog/p')
    astro_files = sorted(blog_dir.glob('*.astro'), key=lambda x: x.stat().st_mtime, reverse=True)

    # Track the most recent date across all posts
    most_recent_date = None

    # Process each file
    for file_path in astro_files:
        try:
            post_data = parse_astro_file(file_path)
            if not post_data:
                print(f"Skipping {file_path}: could not parse")
                continue

            # Update most recent date if this post has a more recent date
            post_date = max(post_data['published_date'], post_data['modified_date'])
            if most_recent_date is None or post_date > most_recent_date:
                most_recent_date = post_date

            # Create feed entry
            fe = fg.add_entry()
            fe.title(post_data['title'])
            fe.link(href=post_data['url'], rel='alternate', type='text/html')
            fe.id(post_data['id'])
            fe.published(post_data['published_date'])
            fe.updated(post_data['modified_date'])
            fe.summary(post_data['description'])
            fe.content(post_data['content'], type='html')
        except Exception as e:
            print(f"Error processing {file_path}: {str(e)}")
            continue

    if not fg.entry():
        print("No items were processed successfully!")
        return

    # Set feed's updated time to the most recent date across all posts
    if most_recent_date:
        fg.updated(most_recent_date)

    # Write feed to file
    fg.atom_file('public/blog/feed.xml', pretty=True)


if __name__ == '__main__':
    main()
