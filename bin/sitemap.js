const SitemapGenerator = require('sitemap-generator');
const generator = SitemapGenerator('https://jmthornton.net', {
	maxDepth: 10,
	stripQuerystring: false,
	filepath: './p/sitemap.xml',
	changeFreq: 'yearly',
});

generator.queueURL('/blog/');
generator.queueURL('/tools/news/');

generator.on('done', () => {
	console.info('done');
});

generator.start();
