'use strict';

function mountCandidates(mountpoint, candidates) {
  const votesNF = new Intl.NumberFormat();
  const percentNF = new Intl.NumberFormat(undefined, { style: 'percent' });
  const totalVotes = candidates.reduce((t, c) => t + c.votes, 0);
  candidates = candidates.map(c => ({...c, rank: rank(c)}));

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
      } = c;

      const votes = votesNF.format(rawVotes);
      const rank = votesNF.format(~~Math.round((1 - c.rank) * 50))
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
                Zoo Ranking: ${rank} | Pledged Delegates: ${votes} ${isNaN(percent) ? '' : '(' + percent + ')'}
              </small>
            </h3>
          </article>
				 `);

      mountpoint.appendChild(card);
    });
}

const rank = (candidate) => {
  // Returns the relative rank for the candidate, ranging from -1 to 1, where -1 is the most
  // favorable. Rank is penalized for dropping out, not yet having officially declared, whether the
  // candidate is "serious", and the median poll percentage (being votes / total votes)
  let algoRank = 0;
  let pollRank = 0;
  if (!candidate.serious) {
    algoRank = 0.5;
  }
  if (candidate.dropped) {
    algoRank = 0.9;
  }
  if (candidate.polls?.length) {
    // convert to -1-1 scale
    pollRank = median(candidate.polls) / 50 - 1;
  }
  console.log(algoRank, pollRank)
  return (algoRank + pollRank) / 2
};

const sortCandidates = (a, b) => {
  return (a.rank - b.rank) || a.sortName.localeCompare(b.sortName);
};

function median(xs) {
  const len = xs.sort().length;
  const half = Math.floor(len / 2);
  return len % 2 ? xs[half] : (xs[half - 1] + xs[half]) / 2.0;
}
