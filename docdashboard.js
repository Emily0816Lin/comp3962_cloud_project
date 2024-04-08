
document.addEventListener('DOMContentLoaded', () => {

    // const searchButton = document.getElementById('searchButton');
    // const searchInput = document.getElementById('searchInput');

    // searchButton.addEventListener('click', () => {
    //     const searchTerm = searchInput.value.trim();
    //     readAllItems(searchTerm);
    // });

    // readAllItems();

    fetch('/profile')
        .then(response => response.json())
        .then(data => {
            fetch('/config/admin-email')
                .then(response => response.json())
                .then(config => {

                    // Check if the email matches
                    if (data.email !== config.adminEmail) {
                        // Redirect to 404.html if the email doesn't match
                        window.location.href = '/404.html';
                    } else {
                        // Initialize the UI and functionality only if the email matches
                        const searchButton = document.getElementById('searchButton');
                        const searchInput = document.getElementById('searchInput');

                        searchButton.addEventListener('click', () => {
                            const searchTerm = searchInput.value.trim();
                            readAllItems(searchTerm);
                        });

                        // Call readAllItems without a search term initially
                        readAllItems();

                    }

                })
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            // Optionally, redirect to 404.html in case of error
            window.location.href = '404.html';
        });
});

// Fetch all items from the API
function readAllItems(searchTerm = '') {
    fetch('/history/api/items')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('historyTable').getElementsByTagName('tbody')[0];
            tableBody.innerHTML = ''; // Clear current table body

            data.data.forEach(item => {
                if (!searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                    const row = document.createElement('tr');

                    const nameCell = document.createElement('td');
                    const nameLink = document.createElement('a'); // Create an anchor tag
                    nameLink.appendChild(document.createTextNode(item.name));
                    nameLink.href = '#'; // Set href to '#' to make it clickable without navigation
                    nameLink.onclick = (event) => {
                        event.preventDefault(); // Prevent the default anchor link behavior
                        showPatientInfo(item); // Call the function
                    };
                    nameCell.appendChild(nameLink);
                    row.appendChild(nameCell);

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

function showPatientInfo(item) {
    document.getElementById('historyTable').style.display = 'none'; // Hide the table
    const patientInfo = document.getElementById('patientInfo');
    patientInfo.style.display = 'block'; // Make the details list visible
    patientInfo.className = 'patientInfo'; // Apply styles from the CSS class
    patientInfo.innerHTML = ''; // Clear current details

    // Add title to the list
    const title = document.createElement('h3');
    title.textContent = 'The Patient Details';
    patientInfo.appendChild(title);

    // Populate details list with information from the item
    const nameLi = document.createElement('li');
    nameLi.textContent = `Patient Name: ${item.name}`;
    patientInfo.appendChild(nameLi);

    // Populate details list with information from the item
    const emailLi = document.createElement('li');
    emailLi.textContent = `Patient Email: ${item.email}`;
    patientInfo.appendChild(emailLi);

    // Add a Go Back button
    const goBackButton = document.createElement('button');
    goBackButton.textContent = 'Go Back';
    goBackButton.className = 'goBackButton'; // Apply styles from the CSS class
    goBackButton.onclick = () => {
        document.getElementById('historyTable').style.display = ''; // Show the table again
        patientInfo.innerHTML = ''; // Clear the details list
        patientInfo.className = ''; // Remove the box style
    };

    patientInfo.appendChild(goBackButton);
}

function showItemDetails(item) {
    document.getElementById('searchContainer').style.display = 'none'; // Hide the search bar
    document.getElementById('historyTable').style.display = 'none';
    const detailsList = document.getElementById('detailsList');
    detailsList.style.display = 'block';
    detailsList.className = 'detailsList';
    detailsList.innerHTML = '';

    const title = document.createElement('h3');
    title.textContent = 'Appointment Details';
    detailsList.appendChild(title);

    function createListItem(content, id, editable = false, isDropdown = false) {
        const li = document.createElement('li');
        li.textContent = `${content}: `;

        if (!editable || !isDropdown) {
            const span = document.createElement('span');
            span.id = `text_${id}`;

            if (id != 'doctorcomment' && id != 'prescription') {
                span.textContent = item[id];
            }
            li.appendChild(span);
        }

        if (editable) {
            if (isDropdown) {
                const select = document.createElement('select');
                select.id = `input_${id}`;
                select.disabled = true; // Initially disable the select

                const optionCompleted = document.createElement('option');
                optionCompleted.value = 'completed';
                optionCompleted.textContent = 'Completed';
                select.appendChild(optionCompleted);

                const optionComing = document.createElement('option');
                optionComing.value = 'coming';
                optionComing.textContent = 'Coming';
                select.appendChild(optionComing);

                select.value = item[id]; // Set the current value
                li.appendChild(select);
            } else {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = item[id];
                input.id = `input_${id}`;
                input.disabled = true; // Initially disable the input
                li.appendChild(input);
            }
        }
        return li;
    }

    // Non-editable fields
    detailsList.appendChild(createListItem('Appointment Date', 'date'));
    detailsList.appendChild(createListItem('Appointment Time', 'time'));
    detailsList.appendChild(createListItem('Patient', 'name'));
    detailsList.appendChild(createListItem('Contact', 'email'));
    detailsList.appendChild(createListItem('Doctor', 'doctor'));
    detailsList.appendChild(createListItem('Department', 'department'));

    // Editable fields
    detailsList.appendChild(createListItem('Doctor\'s Comment', 'doctorcomment', true));
    detailsList.appendChild(createListItem('Prescription', 'prescription', true));

    // Modify the 'Status' field to be a dropdown
    detailsList.appendChild(createListItem('Status', 'status', true, true));

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.className = 'editButton';
    // Edit button onclick function
    editButton.onclick = () => {
        ['doctorcomment', 'prescription', 'status'].forEach(field => {
            const element = document.getElementById(`input_${field}`);
            if (element) {
                element.disabled = false;
            }
        });
        editButton.style.display = 'none'; // Hide edit button after click
        saveButton.style.display = ''; // Show save button when editing
    };
    detailsList.appendChild(editButton);

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Changes';
    saveButton.className = 'saveButton';
    saveButton.style.display = 'none'; // Initially hide save button
    // Save button onclick function
    saveButton.onclick = () => {
        const updatedItem = {
            ...item,
            doctorcomment: document.getElementById('input_doctorcomment').value,
            prescription: document.getElementById('input_prescription').value,
            status: document.getElementById('input_status').value,
        };
        // Call function to update in DB
        updateItemInDynamoDB(updatedItem);
        saveButton.style.display = 'none'; // Hide save button after saving
        editButton.style.display = ''; // Show edit button again

        //unable to edit the fields after saving
        ['doctorcomment', 'prescription', 'status'].forEach(field => {
            const element = document.getElementById(`input_${field}`);
            if (element) {
                element.disabled = true;
            }
        });
    };

    detailsList.appendChild(saveButton);

    const goBackButton = document.createElement('button');
    goBackButton.textContent = 'Go Back';
    goBackButton.className = 'goBackButton';
    goBackButton.onclick = () => {
        // Reload the page
        window.location.reload();
    };
    detailsList.appendChild(goBackButton);

}

function updateItemInDynamoDB(item) {
    console.log("items are :",item);


    const formData = {
        userID : item.userID,
        entryID :item.entryID,
        name: item.name,  // Ensure the key name is included in the update
        email: item.email, // Ensure the key email is included in the update
        doctorcomment: item.doctorcomment,
        prescription: item.prescription,
        status: item.status,
    }

    console.log('Updating item:', formData);

    fetch('/history/api/item', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // Correct header for indicating JSON body
        },
        body: JSON.stringify(formData), // Adjust to match the expected JSON structure
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            // window.location.reload(); // Refresh the page after successful data submission
        })
        .catch((error) => console.error('Error:', error));
}
