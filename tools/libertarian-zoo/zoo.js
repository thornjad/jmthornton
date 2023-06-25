'use strict';

function mountCandidates(mountpoint, candidates) {
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
                ${votes} delegates ${isNaN(percent) ? '' : '(' + percent + ')'}
              </small>
            </h3>
          </article>
				 `);

      mountpoint.appendChild(card);
    });
}

const sortCandidates = (a, b) => {
  // Dropped goes to the bottom, serious goes to the top, then sorted by votes, then alphabetically
  return (a.dropped ? 1 : a.serious ? -1 : 1) - (b.dropped ? 1 : b.serious ? -1 : 1) || a.sortName.localeCompare(b.sortName);

  // (b.dropped ? -1 : b.votes) - (a.dropped ? -1 : a.votes) || a.sortName.localeCompare(b.sortName)
}
