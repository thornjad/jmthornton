# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About This Project

This is the source code for jmthornton.net, a personal website that serves as a playground for ideas and projects, as well as explorations in new development approaches and languages. The website includes a blog, recipes, tools, and various project showcases.

## Development Commands

### Building and Development
- `make all` - Build everything (feeds and styles)
- `make style` - Build CSS styles including Prism syntax highlighting
- `make server` - Start local development server using http-server on default port
- `make feed` - Generate RSS feeds (requires Python 3 with feedgen and bs4)

### Individual Tasks
- `make prism` - Minify Prism CSS files for syntax highlighting
- `npx http-server -c-1` - Start development server with cache disabled

## Architecture Overview

### Project Structure
This is primarily a static website with mixed technology stack:

**Frontend Assets:**
- `/assets/style/main.css` - Main stylesheet with custom fonts (MetroNova, VictorMono)
- `/assets/fonts/` - Custom web fonts
- `/assets/images/` - Site images and icons
- `/lib/` - Client-side JavaScript (oneko.js, trail.js)

**Content Organization:**
- `/blog/` - Blog posts in HTML format with organized assets
- `/blog/recipes/` - Recipe collection
- `/tools/` - Interactive web tools (JWT decoder, URL encoder, news aggregator, etc.)
- `/projects/` - Project showcases
- `/readables/` - Readable content including Orson documentation

**Build System:**
- npm provides http-server for development and purify-css for optimization
- Python script (bin/feed.py) generates RSS feeds

### Key Technologies
- **HTML/CSS** - Frontend with custom styling and fonts
- **JavaScript** - Minimal client-side features (oneko cursor follower)
- **Python** - Feed generation

### Content Management
Blog posts and recipes are stored as HTML files with a template system in `/blog/_template/`. The site uses a flat file structure rather than a database.

