document.addEventListener('DOMContentLoaded', () => {
  const searchButton = document.getElementById('searchButton');
  searchButton.addEventListener('click', searchAcronym);
});

function searchAcronym() {
  const input = document.getElementById('acronymInput').value.trim().toUpperCase();
  const firstWord = input.split(' ')[0]; // Retrieve the first word

  // Clear previous results
  document.getElementById('results').innerHTML = '';

  // Call the API with the firstWord
  fetch(`/api/search?acronym=${encodeURIComponent(firstWord)}`)
    .then(response => response.json())
    .then(data => {
      if (data.found) {
        // Display table with results
        showResultsTable(data.results);
      } else {
        // Display suggestion form
        showSuggestionForm(firstWord);
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function showResultsTable(results) {
  const table = document.createElement('table');
  const thead = table.createTHead();
  const row = thead.insertRow();
  const headers = ['Acronym', 'Meaning', 'Suggester'];

  for (let header of headers) {
    const th = document.createElement('th');
    const text = document.createTextNode(header);
    th.appendChild(text);
    row.appendChild(th);
  }

  const tbody = table.createTBody();

  for (let result of results) {
    const row = tbody.insertRow();
    const { initialism, meaning, suggester } = result;

    for (let value of [initialism, meaning, suggester]) {
      const cell = row.insertCell();
      const text = document.createTextNode(value);
      cell.appendChild(text);
    }
  }

  document.getElementById('results').appendChild(table);

  // Clear input field and button
  document.getElementById('acronymInput').value = '';
}

function showSuggestionForm(acronym) {
  const suggestionText = document.createElement('p');
  suggestionText.innerText = `Sorry, no matches were found for ${acronym}. Can you provide a suggestion?`;

  const meaningInput = document.createElement('input');
  meaningInput.setAttribute('type', 'text');
  meaningInput.setAttribute('placeholder', 'Enter the meaning');

  const submitButton = document.createElement('button');
  submitButton.innerText = 'Submit';
  submitButton.addEventListener('click', () => {
    submitSuggestion(acronym, meaningInput.value.trim());
  });

  const container = document.getElementById('results');
}
