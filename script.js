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

  // Clear input field
  document.getElementById('acronymInput').value = '';
}

function showSuggestionForm(acronym) {
  const suggestionText = document.createElement('p');
  suggestionText.innerText = `Sorry, no matches were found for ${acronym}. Can you provide a suggestion?`;

  // Create the div for the name input and label
  const nameDiv = document.createElement('div');
  nameDiv.className = 'input-div';  // Apply the CSS class

  const nameLabel = document.createElement('label');
  nameLabel.innerText = 'Your name';
  nameLabel.className = 'input-label';

  const nameInput = document.createElement('input');
  nameInput.setAttribute('type', 'text');
  nameInput.setAttribute('placeholder', 'Enter your name');
  nameInput.setAttribute('title', 'Your name');
  nameInput.required = true;
  nameInput.className = 'input-field';

  // Append the name label and input to the name div
  nameDiv.appendChild(nameLabel);
  nameDiv.appendChild(nameInput);

  // Create the div for the suggestion input and label
  const suggestionDiv = document.createElement('div');
  suggestionDiv.className = 'input-div';  // Apply the CSS class

  const suggestionLabel = document.createElement('label');
  suggestionLabel.innerText = 'Your suggestion';
  suggestionLabel.className = 'input-label';

  const meaningInput = document.createElement('input');
  meaningInput.setAttribute('type', 'text');
  meaningInput.setAttribute('placeholder', 'Enter your suggestion');
  meaningInput.setAttribute('title', 'Enter your suggestion');
  meaningInput.required = true;
  meaningInput.className = 'input-field';

  // Append the suggestion label and input to the suggestion div
  suggestionDiv.appendChild(suggestionLabel);
  suggestionDiv.appendChild(meaningInput);

  const submitButton = document.createElement('button');
  submitButton.innerText = 'Submit';
  submitButton.disabled = true;

  const enableSubmitButton = () => {
    submitButton.disabled = !(nameInput.value && meaningInput.value);
  };

  nameInput.addEventListener('input', enableSubmitButton);
  meaningInput.addEventListener('input', enableSubmitButton);

  submitButton.addEventListener('click', () => {
    submitSuggestion(acronym, nameInput.value.trim(), meaningInput.value.trim());
  });

  const container = document.getElementById('results');
  container.appendChild(suggestionText);
  container.appendChild(nameDiv);  // Append the name div
  container.appendChild(suggestionDiv);  // Append the suggestion div
  container.appendChild(submitButton);
}

function submitSuggestion(acronym, suggester, meaning) {
  // Send a POST request to the API
  fetch('/api/suggest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ acronym: acronym, suggester: suggester, meaning: meaning }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const container = document.getElementById('results');
        // Clear the container
        container.innerHTML = '';
        // Create and display the success message
        const successText = document.createElement('p');
        successText.innerText = `Thank you for your suggestion. You suggested that ${acronym} means: ${meaning}.`;
        container.appendChild(successText);
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
}
