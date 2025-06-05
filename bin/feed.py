#!/usr/bin/env python3

from datetime import datetime, timezone
from bs4 import BeautifulSoup
from feedgen.feed import FeedGenerator
from pathlib import Path


def parse_html_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    soup = BeautifulSoup(content, 'html.parser')

    # Get title
    title_tag = soup.find('h1', class_='post-title')
    if not title_tag:
        title = file_path.stem
    else:
        title = title_tag.text.strip()

    # Get dates - try meta tags first, then time element, then file modification time
    published_date = None
    modified_date = None
    
    # Try article:published_time meta tag
    published_meta = soup.find('meta', attrs={'property': 'article:published_time'})
    if published_meta and 'content' in published_meta.attrs:
        try:
            published_date = datetime.strptime(published_meta['content'], '%Y-%m-%d').replace(tzinfo=timezone.utc)
        except ValueError:
            pass

    # Try article:modified_time meta tag
    modified_meta = soup.find('meta', attrs={'property': 'article:modified_time'})
    if modified_meta and 'content' in modified_meta.attrs:
        try:
            modified_date = datetime.strptime(modified_meta['content'], '%Y-%m-%d').replace(tzinfo=timezone.utc)
        except ValueError:
            pass

    # If no published time from meta, try modified time
    if not published_date and modified_date:
        published_date = modified_date

    # If still no published time, try time element
    if not published_date:
        time_tag = soup.find('time')
        if time_tag and 'datetime' in time_tag.attrs:
            try:
                published_date = datetime.strptime(time_tag['datetime'], '%Y-%m-%d').replace(tzinfo=timezone.utc)
            except ValueError:
                pass

    # If still no published date, use file modification time
    if not published_date:
        published_date = datetime.fromtimestamp(file_path.stat().st_mtime, tz=timezone.utc)

    # If no modified date, use published date
    if not modified_date:
        modified_date = published_date

    # Get description from meta tag
    meta_desc = soup.find('meta', attrs={'name': 'description'})
    description = meta_desc['content'].strip() if meta_desc else ''

    # Get main content
    main_content = soup.find('div', class_='blog-body')
    if main_content:
        content_html = str(main_content)
    else:
        content_html = description  # Fallback to meta description if no content

    # Get post URL
    post_id = file_path.stem
    url = f'https://jmthornton.net/blog/p/{post_id}'

    return {
        'title': title,
        'published_date': published_date,
        'modified_date': modified_date,
        'description': description,
        'content': content_html,
        'url': url,
        'id': url
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

    # Get all HTML files in blog/p directory
    blog_dir = Path('blog/p')
    html_files = sorted(blog_dir.glob('*.html'), key=lambda x: x.stat().st_mtime, reverse=True)

    # Process each file
    for file_path in html_files:
        try:
            post_data = parse_html_file(file_path)
            
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

    # Update feed's updated time to most recent modified date
    if html_files:
        most_recent = parse_html_file(html_files[0])
        fg.updated(most_recent['modified_date'])

    # Write feed to file
    fg.atom_file('blog/feed.xml', pretty=True)


if __name__ == '__main__':
    main()
