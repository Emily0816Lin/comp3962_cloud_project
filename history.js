document.addEventListener('DOMContentLoaded', () => {
    // readAllItems();


    // Fetch profile data first
    fetch('/profile')
        .then(response => response.json())
        .then(data => {
            // Populate fields
            // document.getElementById('name').value = data.name;
            // document.getElementById('email').value = data.email;

            // Now call readAllItems with the fetched name and email
            readAllItems(data.name, data.email);
        })
        .catch(error => console.error('Error fetching user data:', error));
});

// fetch('/profile')
//     .then(response => response.json())
//     .then(data => {
//         // Populate name field
//         document.getElementById('name').value = data.name;

//         // Populate email field
//         document.getElementById('email').value = data.email;
//     })
//     .catch(error => console.error('Error fetching user data:', error));



// Fetch all items from the API
// function readAllItems() {
function readAllItems(userName, userEmail) {
    fetch('/history/api/items')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('historyTable').getElementsByTagName('tbody')[0];
            tableBody.innerHTML = ''; // Clear current table body

            data.data.forEach(item => {
                if (item.name === userName && item.email === userEmail) {
                    const row = document.createElement('tr');

                    const dateCell = document.createElement('td');
                    dateCell.appendChild(document.createTextNode(item.date));
                    row.appendChild(dateCell);

                    const timeCell = document.createElement('td');
                    timeCell.appendChild(document.createTextNode(item.time));
                    row.appendChild(timeCell);

                    const statusCell = document.createElement('td');
                    const statusSpan = document.createElement('span');
                    statusSpan.textContent = item.status;
                    statusSpan.className = 'statusStyle'; // Assign a class for styling

                    // Apply specific class based on the status value
                    if (item.status.toLowerCase() === 'completed') {
                        statusSpan.classList.add('statusCompleted');
                    } else if (item.status.toLowerCase() === 'coming') {
                        statusSpan.classList.add('statusComing');
                    }

                    statusCell.appendChild(statusSpan);
                    row.appendChild(statusCell);

                    // Details cell
                    const detailsCell = document.createElement('td');
                    const viewButton = document.createElement('button');
                    viewButton.classList.add('viewButton');
                    viewButton.textContent = '🔍 View';
                    viewButton.onclick = () => showItemDetails(item); // Set onclick event
                    detailsCell.appendChild(viewButton);
                    row.appendChild(detailsCell);

                    tableBody.appendChild(row);
                }
            });

        })
        .catch(error => console.error('Error fetching items:', error));
}


// Show details of a specific item
function showItemDetails(item) {
    const historyTable = document.getElementById('historyTable');
    const detailsList = document.getElementById('detailsList');

    // Function to toggle display and content
    function toggleDisplay(element, display, className = '', innerHTML = '') {
        element.style.display = display;
        if (className) element.className = className;
        if (innerHTML !== undefined) element.innerHTML = innerHTML;
    }

    // Function to create and append elements
    function createElementAndAppend(type, parent, content, className = '') {
        const element = document.createElement(type);
        if (content) element.textContent = content;
        if (className) element.className = className;
        parent.appendChild(element);
        return element;
    }

    // Hide the table and show the details list
    toggleDisplay(historyTable, 'none');
    toggleDisplay(detailsList, 'block', 'detailsList');

    // Add title
    createElementAndAppend('h3', detailsList, 'Appointment Details');

    // Populate details list
    const details = [
        `Appointment Date: ${item.date}`,
        `Appointment Time: ${item.time}`,
        '',
        `Patient: ${item.name}`,
        `Contact: ${item.email}`,
        '',
        `Doctor: doctor name here`,
        `Department: department name here`,
        `Doctor's Comment: ${item.doctorcomment}`,
        '',
        `Prescription: ${item.prescription}`,
        '',
        `Status: ${item.status}`,
    ];

    details.forEach(detail => {
        if (detail === '') {
            createElementAndAppend('div', detailsList, null, 'separator');
        } else {
            createElementAndAppend('li', detailsList, detail);
        }
    });

    // Add Go Back button
    const goBackButton = createElementAndAppend('button', detailsList, 'Go Back', 'goBackButton');
    goBackButton.onclick = () => {
    // // Show historyTable by setting its display to 'block' or a suitable display style
    // toggleDisplay(historyTable, 'block', 'historyTable');

    // // Hide detailsList by setting its display to 'none'
    // toggleDisplay(detailsList, 'none');
        // Refresh the page
        window.location.reload();
    };
}