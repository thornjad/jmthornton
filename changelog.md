# Changelog
All notable changes to this project will be documented in this file.

## [unreleased]
- Nothing so far

## [5.4.0] - 2020-03-10
### Added
- Re-added local analytics

## [5.3.5] - 2020-02-21
### Changed
- Fixed coloring on news page

## [5.3.4] - 2020-02-20
### Changed
- Main link colors now based on green.
- Dark header bar

### Added
- bh endpoint

## [5.3.3] - 2020-02-05
### Added
- Added date to Libertarian zoo. Further changes will not be tracked by
  versioning.

## [5.3.2] - 2020-02-05
### Changed
- Fixed tools and projects landing page spacing

## [5.3.1] - 2020-02-05
### Changed
- Updated Libertarian zoo.

## [5.3.0] - 2020-02-05
### Changed
- Updated build dependencies
- Styling updates

### Added
- Libertarian zoo

## [5.2.2] - 2019-09-18
### Changed
- Fix version link

## [5.2.1] - 2019-09-17
### Changed
- Copy updates

### Added
- Version number now links to this document

## [5.2.0] - 2019-09-12
### Changed
- Build process uses JS port of Sass, rather than the old Ruby version
- Upgraded Babel build tools into the age of Babel 7
- Build process is now internally partially asynchronous

### Added
- Front page text

### Removed
- Build no longer depends on Ruby Sass

### Security
- Upgraded build dependencies. No true vulnerabilities existed in prod, but now
  we're extra safe

## [5.1.1] - 2019-08-28
### Changed
- Updated travis badge url
- Updated http-server url
- Tweak site button SVGs

### Added
- Additional site buttons

## [5.1.0] - 2019-08-22
### Changed
- Major copy updates

## [5.0.2] - 2019-08-22
### Changed
- Main page copy updates

## [5.0.1] - 2019-08-22
### Changed
- Main page copy updates

## [5.0.0] - 2019-08-22
### Changed
- Restructure /assets/scripts into /lib and /bin
- Update main page
- Defer scripts on main pages
- Use fetch to grab version instead of XHR

### Added
- New readme file
- Redirect blog.jmt.net/blog to blog.jmt.net

### Removed
- Matomo analytics
- Release notes (they were outdated anyway)
- Gallery
- All remaining webminer tools
- Duplicate news script

## [4.0.0] - 2019-02-15
### Changed
- Upgrade to mini.css 3
- Move mini.css to npm, not committed
- All external CSS
- Package updates

### Added
- Add new tools index page
- Published on Dat

### Removed
- Unused flow config file

## [3.5.0] - 2019-02-15
### Added
- This changelog, backfilled for all releases
- Prefetch links on main page with instant.page

### Changed
- Use Gitlab link on index pages and latest posts

### Removed
- Unused 50*.shtml files

## [3.4.2] - 2019-02-12
### Changed
- Snyk is now a dev dependency, not full dependency

## [3.4.1] - 2019-02-12
### Removed
- Flow typing

### Security
- Dependency updates to fix numerous vulnerabilities

## [3.4.0] - 2019-01-21
### Added
- Recipes section to blog
- Egg salad recipe

## [3.3.4] - 2019-01-20
### Changed
- Many link updates
- Copyright year bump

## [3.3.3] - 2019-01-20
### Changed
- Remove React construction banner

## NOTE
- There was a long stint of small changes that were not properly recorded with
semantic versioning

## [3.0.3] - 2017-09-22
### Changed
- Purify and minimize production files

## [3.0.2] - 2017-09-15
### Changed
- npm versions

## [3.0.1] - 2017-09-15
### Changed
- Many copy updates

## [3.0.0] - 2017-09-15
### Changed
- Complete CSS rewrite

### Added
- mini.css styling
- Sass compilation via scripts

### Removed
- Bootstrap framework

## [2.8.2] - 2017-06-23
### Added
- npm package management

## NOTE
- There was a large gap due to rapid development and a complete lack of semantic
 versioning

## [0.7.1] - 2016-11-13
### Changed
- Changed site name into logo

## [0.7.0] - 2016-10-21
### Changed
- Updated navigation layout and links

## [0.6.4] - 2016-10-20
- First open source release

### Added
- Initial commit into version control. Before this point, the site was updated
  live.
  <https://gitlab.com/thornjad/jmthornton/commit/ba1d848cf0b649d10bb09a14dcc3900c14e2e774>
