'use strict';

async function mountCandidates(mountpoint) {
  let [{candidates}, polls] = await Promise.all([
    fetch('data/2024/candidates.json').then(r => r.json()),
    fetch('data/2024/polls.json').then(r => r.json()),
  ]);

  candidates = candidates.map(c => ({...c, pollMedian: median(polls[c.sortName])}));

  const votesNF = new Intl.NumberFormat();
  const percentNF = new Intl.NumberFormat(undefined, { style: 'percent' });
  const totalVotes = candidates.reduce((t, c) => t + c.votes, 0);

  candidates
    .sort(sortCandidates)
    .forEach((c, i) => {
      const {
        name,
        pic = 'no-photo.png',
        url = '',
        title = 'Person running for president',
        info = 'No additional information available at this time',
        votes: rawVotes = 0,
        dropped = false,
        pollMedian = 0,
      } = c;

      const votes = votesNF.format(rawVotes);
      const place = dropped ? '' : `#${i + 1}`;
      const rawPercent = rawVotes / totalVotes;
      const percent = (rawPercent < 0.01 && rawPercent > 0)
        ? '< 1%'
        : percentNF.format(rawPercent);
      const noPhoto = !c.pic || c.pic === '';
      const uncommitted = name === 'Uncommitted';

      const card = document.createRange().createContextualFragment(`
          <article class="card fluid ${dropped ? 'dropped-out' : ''}">
            <div class="dropped-out-overlay"></div>
            <div class="img-container ${uncommitted ? 'nota' : ''} ${noPhoto ? '' : 'no-photo'}">
              <img loading="lazy" alt="${name}" src="./images/2024/${pic}" />
            </div>
            <h3 class="candidate">
              <em>${place}</em>&nbsp;<a href="${url}">${name}</a>
              <small class="candidate-title"><em>
                ${title}
              </em></small>
              <p class="info">${info}</p>
              <small class="dropped-text"><em>
                ${dropped ? 'Dropped out' : ''}
              </em></small>
              <small class="popular-vote">
                Median Polling: ${pollMedian} | Pledged Delegates: ${votes} ${isNaN(percent) ? '' : '(' + percent + ')'}
              </small>
            </h3>
          </article>
				 `);

      mountpoint.appendChild(card);
    });
}

const sortCandidates = (a, b) => {
  const dropped = Number(b.dropped ?? 0) - Number(a.dropped ?? 0);
  const votes = (a.votes - b.votes) || 0;
  const serious = Number(b.serious ?? 0) - Number(a.serious ?? 0);
  const polls = b.pollMedian - a.pollMedian;
  // Sorting in order of importance of these various factors
  return dropped || votes || serious || polls || a.sortName.localeCompare(b.sortName);
};

function median(xs = []) {
  const len = xs.length;
  if (!len) return 0;
  const half = Math.floor(len / 2);
  xs.sort();
  return len % 2 ? xs[half] : (xs[half - 1] + xs[half]) / 2.0;
}
