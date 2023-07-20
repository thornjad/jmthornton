'use strict';

function decode(string) {
  const b64 = string.replace(/-/g, '+').replace(/_/g, '/');
  const json = JSON.parse(
    decodeURIComponent(
      atob(b64)
        .split('')
        .map((c) => '%' + `00${c.charCodeAt(0).toString(16)}`.slice(-2))
        .join(''),
    ),
  );
  return JSON.stringify(json, undefined, 2);
}

document.querySelector('#decode').addEventListener('click', () => {
  const token = document.querySelector('#input').value;
  const headerOutput = document.querySelector('#header');
  const payloadOutput = document.querySelector('#payload');

  try {
    error.style.display = 'none';
    const [header, payload] = token.split('.');
    const [prettyHeader, prettyPayload] = [header, payload].map(decode);
    headerOutput.innerText = `${prettyHeader}`;
    payloadOutput.innerText = `${prettyPayload}`;
    document.querySelector('#output-wrapper').style.display = 'block';
  } catch (e) {
    document.querySelector('#output-wrapper').style.display = 'none';
    const error = document.querySelector('#error');
    error.innerText = `Error: Could not parse JWT:\n${e}`;
    error.style.display = 'block';
  }
});
