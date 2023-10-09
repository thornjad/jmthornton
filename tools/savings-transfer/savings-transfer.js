'use strict';

document.querySelector('#add-cd').addEventListener('click', addCDLine);
document.querySelector('#calculate').addEventListener('click', calculate);
document.querySelectorAll('input[type=currency]')
  .forEach(i => i.addEventListener('blur', onCurrencyBlur));

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const parseReg = /[^0-9.]+/g;

function calculate() {
  // budgeted is the input#budget value interpreted as currency
  const budgeted = parseFloat(
    document.querySelector('input[name=budget]').value.replace(parseReg, '')
  ).toFixed(2);
  const actual = parseFloat(
    document.querySelector('input[name=savings]').value.replace(parseReg, '')
  ).toFixed(2);

  const cdTotal = Array.from(document.querySelectorAll('input.cd-line')).reduce((acc, cd) => {
    const cdValue = parseFloat(cd.value.replace(parseReg, ''));
    return isNaN(cdValue) ? acc : acc + cdValue;
  }, 0);

  const difference = budgeted - actual - cdTotal;
  const message = generateMessage(difference);
  const summary = generateSummary({ budgeted, actual, cdTotal, difference });

  document.querySelector('#transfer-output').innerHTML = message;
  document.querySelector('#transfer-summary').innerHTML = summary;
}

function generateMessage(difference) {
  if (isNaN(difference)) {
    return "Error, please check the numbers again"
  }

  const direction = difference > 0 ? 'into' : 'out of';
  const amount = Math.abs(difference);

  if (difference === 0.00) {
    return "Savings account is correctly reconciled."
  }

  const formattedAmount = formatter.format(amount);
  return `Transfer ${formattedAmount} <strong>${direction}</strong> savings account.`;
}

function generateSummary({ budgeted, actual, cdTotal, difference }) {
  if (isNaN(difference)) {
    return '';
  }
  const formattedBudgeted = formatter.format(budgeted);
  const formattedActual = formatter.format(actual);
  const formattedCdTotal = formatter.format(cdTotal);
  const formattedDifference = formatter.format(difference);
  return `Budgeted ${formattedBudgeted} - Savings Account ${formattedActual} - CDs ${formattedCdTotal} = ${formattedDifference}`
}

function addCDLine() {
  const newLineIndex = document.querySelectorAll('input.cd-line').length;
  const span = document.createElement('span');
  span.innerHTML = `<input type="currency" class="cd-line" name="cd${newLineIndex}" placeholder="CD ${newLineIndex + 1}" />
    <label for="cd${newLineIndex}">CD ${newLineIndex + 1}</label>
  </input>`;
  span.querySelector('input').addEventListener('blur', onCurrencyBlur);
  document.querySelector('#cd-section').appendChild(span);
}

function onCurrencyBlur(e) {
  const value = parseFloat(e.target.value.replace(parseReg, '')).toFixed(2);
  e.target.value = isNaN(value) ? '' : formatter.format(value);
}
