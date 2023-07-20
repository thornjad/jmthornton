let startCap = true;

const getValue = () => {
  const sponger = document.querySelector('#sponger');
  return [sponger, sponger.value];
};

document.querySelector('#sponge').addEventListener('click', () => {
  const [sponger, value] = getValue();
  sponger.value = (startCap ? value.toUpperCase() : value.toLowerCase())
    .split('')
    .map((l, i) => (i % 2 === 1 ? (startCap ? l.toLowerCase() : l.toUpperCase()) : l))
    .join('');
});
document.querySelector('#desponge').addEventListener('click', () => {
  const [sponger, value] = getValue();
  sponger.value = value.toLowerCase();
});

document.querySelector('#startCap').addEventListener('change', (e) => {
  startCap = e.target.checked;
});
