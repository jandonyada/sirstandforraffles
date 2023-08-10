// Wait for DOM to fully load. Btw, I'm using vanilla JavaScript here (lol) to manipulate the DOM and making HTTP requests
document.addEventListener('DOMContentLoaded', () => {
  // Selects the HTML element with ID 'searchForm' and assigns it to the 'searchForm' variable
  const searchForm = document.getElementById('searchForm');
  const searchButton = document.getElementById('searchButton'); // Assuming the search button has an ID of 'searchButton'

  // Listens to 'submit' event of 'searchForm'
  searchForm.addEventListener('submit', event => {
    // Form submission causes a page reload (which we don't want), so this stops that
    event.preventDefault();

    // Calls the function 'searchAcronym()' to handle form submissions
    searchAcronym();
  });

  // Add an input event listener to the search input
  const acronymInput = document.getElementById('acronymInput');
  acronymInput.addEventListener('input', () => {
    // Disable the search button if the input is empty or contains only white spaces
    searchButton.disabled = acronymInput.value.trim() === '';
  });

  // Initial check and disable if the input is empty
  searchButton.disabled = acronymInput.value.trim() === '';
});

// this defines the searchAcronym function, which the primary way the frontend passes each form submission for the backend to process
function searchAcronym() {
  // removes white spaces & converts entire string to uppercase (because the acronyms in the DB are all uppercase)
  const input = document.getElementById('acronymInput').value.trim().toUpperCase();
  // Splits string by space (which converts the string into an array of strings), then takes the first word with [0]. We'll use this to search the DB for acronyms.
  const firstWord = input.split(' ')[0];

  // Clears previous results by finding an HTML element with the `id` attribute `results` in the HTML doc, then sets the content to an empty string.
  document.getElementById('results').innerHTML = '';

  // Call the API with the firstWord variable.
  // fetch() initiates a HTTP GET request to the specified URL
  // We use ${} convention to insert `firstWord` as the `acronym` query parameter, but also use `encodeURIComponent` to safely encode `firstWord` in case it contains special characters (which could cause the URL to not be valid.)
  fetch(`/api/search?acronym=${encodeURIComponent(firstWord)}`)
    // This is part of what is called a 'promise chain', i.e. when the fetch() request is made, the `.then` methods are used to handle the responses.
    // response => response.json() parses the response into JSON
    .then(response => response.json())
    // Continuation of the promise chain. It takes the parsed JSON data from the previous step and processes it.
    .then(data => {
      // `.found` checks if there's data in the response or not
      if (data.found) {
        // If acronym has match(es), then display a table with the results. Table because it's the easiest way to represent an array (there can be multiple hits for a given acronym)
        showResultsTable(data.results);
      } else {
        // If no match, display suggestion form, which allows users to suggest meaning to the unknown acronym. Actually, we should always allow a suggestion form, even if matches are found. Next time lah :p
        showSuggestionForm(firstWord);
      }
    })
    // If for some reason got error whenever calling this function, the thrown error is printed onto the console. Can make it more verbose, but for now it just says 'Error'. 
    .catch(error => {
      console.error('Error:', error);
    });
}

// This is a function to display any results in table format.
function showResultsTable(results) {
  // Creates a new HTML <table> element. This will be the container for the results to be displayed in.
  const table = document.createElement('table');
  // Column headers!
  const thead = table.createTHead();
  // Inserts rows within the thead element 
  const row = thead.insertRow();
  // Defining headers for the column headers
  const headers = ['Acronym', 'Meaning', 'Suggester'];

  // Loops through the array of column headers above to create table header cells for each array item
  for (let header of headers) {
    const th = document.createElement('th');
    const text = document.createTextNode(header);
    th.appendChild(text);
    row.appendChild(th);
  }

  // Body section of the table. This is the thing that actually contains the results in rows.
  const tbody = table.createTBody();

  // Loops through each item in `result`
  for (let result of results) {
    // for each result, insert a new row into the table
    const row = tbody.insertRow();
    // Destructure the `result` object, so that it can have properties that mirror the `known_initialisms` DB table: initialism, meaning, suggester!
    const { initialism, meaning, suggester } = result;

    // For each item in the `result` array (that has now been destructured into initialism, meaning, suggester), create the cells in the row
    for (let value of [initialism, meaning, suggester]) {
      // creates a new table cell within the row
      const cell = row.insertCell();
      // Preps the text we need to put inside each cell, where `value` represents the current value of `initialism`, `meaning`, and `suggester`.
      const text = document.createTextNode(value);
      // Adds the text to the cell as cell content.
      cell.appendChild(text);
    }
  }
  // appends the generated table (from the showResultsTable function) as a child element of `results` (in the HTML).
  document.getElementById('results').appendChild(table);

  // Minor usability improvement to ensure that the input field is reset and ready for the user to perform another search without any leftover content from the previous search.
  document.getElementById('acronymInput').value = '';
}

// Function to display a suggestion form so users can suggest a meaning for an unknown acronym
function showSuggestionForm(acronym) {
  // creates a paragraph element that says....
  const suggestionText = document.createElement('p');
  // ...this when there are no matches from the searchAcronym function
  suggestionText.innerText = `Sorry, no matches were found for ${acronym}. Can you provide a suggestion?`;

  // creates a form
  const form = document.createElement('form');

  // Create the div for the name input and label
  const nameDiv = document.createElement('div');
  nameDiv.className = 'input-div';  // Apply the CSS class (line 60 of index.html)

  // creates a new HTML <label> element and assigns it to the `nameLabel` variable
  const nameLabel = document.createElement('label');
  // Set the content of the label to 'Your name'
  nameLabel.innerText = 'Your name';
  // Assigns the CSS class `input-label` to the `label` element
  nameLabel.className = 'input-label';

  // creates a new HTML <input> element, and assigns it to the `nameInput` variable.
  const nameInput = document.createElement('input');
  // sets the input to a `text` type, indicating that the input field is meant for text input.
  nameInput.setAttribute('type', 'text');
  nameInput.setAttribute('placeholder', 'Enter your name');
  // when you mouseover the input, it'll also show 'Your name'–just a smol ting
  nameInput.setAttribute('title', 'Your name');
  nameInput.required = true;
  // Assigns the CSS class `input-field` to the `input` element, so you can style this element using CSS
  nameInput.className = 'input-field';

  // Append the name label and input to the name div
  nameDiv.appendChild(nameLabel);
  nameDiv.appendChild(nameInput);

  // Create the div for the suggestion input and label
  const suggestionDiv = document.createElement('div');
  suggestionDiv.className = 'input-div';  // Apply the CSS class

  // creates a new <label> HTML element and assigns it to the `suggestionLabel` variable
  const suggestionLabel = document.createElement('label');
  suggestionLabel.innerText = 'Your suggestion';
  // same CSS class as nameLabel
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

  // creates a new button element to the HTML and assigns it the `submitButton` variable
  const submitButton = document.createElement('button');
  submitButton.innerText = 'Submit';
  submitButton.setAttribute('type', 'submit');
  // disable it by default
  submitButton.disabled = true;

  // disable the submit button if either name or meaning input fields are empty
  const enableSubmitButton = () => {
    submitButton.disabled = !(nameInput.value && meaningInput.value);
  };

  // adds event listeners to both the `nameInput` element and the `meaningInput` element
  nameInput.addEventListener('input', enableSubmitButton);
  meaningInput.addEventListener('input', enableSubmitButton);

  // adds an event listener to the `form` element, and the event being listened to is the `submit` event, which occurs when a user submits the form
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submitSuggestion(acronym, nameInput.value.trim(), meaningInput.value.trim());
  });

  form.appendChild(suggestionText); // Append suggestionText into the form
  form.appendChild(nameDiv);  // Append the name div to the form
  form.appendChild(suggestionDiv);  // Append the suggestion div to the form
  form.appendChild(submitButton); // Append the submit button to the form

  // gets a reference to the `results` element
  const container = document.getElementById('results');
  container.appendChild(form); // appends the form to the `results` container
}

// This function handles the submission itself AND the response from the server.
function submitSuggestion(acronym, suggester, meaning) {
  // Send a POST request to the API.
  fetch('/api/suggest', {
    method: 'POST', // Method is POST since we're adding the suggestion to the table.
    headers: {
      'Content-Type': 'application/json', // Request body is JSON
    },
    body: JSON.stringify({ acronym: acronym, suggester: suggester, meaning: meaning }), // to construct the body of the request, we use .stringify to convert the object (that contains acronym, suggester, meaning) into a JSON string.
  })
    .then(response => response.json()) // parses the JSON data from the response
    .then(data => {
      if (data.success) { // 
        const container = document.getElementById('results');
        // Clear the `results` container
        container.innerHTML = '';
        // Create and display the success message
        const successText = document.createElement('p');
        successText.innerText = `Thank you for your suggestion. You suggested that ${acronym} means: ${meaning}.`; // success message that includes the acronym and the suggested meaning by the user.
        container.appendChild(successText); // append the success message to the `results` container
      }
    })
    .catch(error => { // if any errors occur during the fetch or promise chain, we log the error message in the console.
      console.error('Error:', error);
    });
}
