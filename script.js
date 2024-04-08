document.addEventListener("DOMContentLoaded", function() {
    // Function to fetch available slots for the selected date
    function fetchAvailableSlots(selectedDate) {
        const formattedDate = selectedDate.split('-').reverse().join('-');
console.log("Formatted date:", formattedDate);
        fetch(`/slots?date=${formattedDate}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(slots => {
                if (slots.length === 0) {
                    showNoSlotsMessage();
                    return;
                }
                populateTimeSlots(slots);
            })
            .catch(error => {
                console.error("Error fetching available slots:", error.message);
            });
    }

    function showNoSlotsMessage() {
        var timeSlotsContainer = document.getElementById("time-slots");
        timeSlotsContainer.innerHTML = "<p>No slots available for selected date</p>";
    }
    // Function to populate available time slots in the HTML form
    function populateTimeSlots(slots) {
        var timeSlotsContainer = document.getElementById("time-slots");
        timeSlotsContainer.innerHTML = ""; // Clear existing slots

        slots.forEach(function(slot) {
            if(slot.Available === "yes"){
            var slotDiv = document.createElement("div");
            slotDiv.classList.add("form-group");
            var timeLabel = document.createElement("label");
            timeLabel.textContent = slot.time;
            slotDiv.appendChild(timeLabel);
            var radioInput = document.createElement("input");
            radioInput.type = "radio";
            radioInput.id = slot.time; // Assuming time is unique
            radioInput.name = "time";
            radioInput.value = slot.time;
            slotDiv.appendChild(radioInput);
            timeSlotsContainer.appendChild(slotDiv);
            }
        });
    }

    // Event listener for date select input change
    document.getElementById("date").addEventListener("change", function() {
        var selectedDate = this.value;
        console.log("Selected date:", selectedDate);
        
            fetchAvailableSlots(selectedDate);
        
    });
});

async function submitForm(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        date: formatDate(document.getElementById("date").value), // Format the date
        time: document.querySelector('input[name="time"]:checked').value
    };
    
    const response = await fetch('/bookAppointment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    });
    
    if (response.ok) {
        const responseData = await response.json();
        console.log(responseData);
        alert('Appointment booked successfully! Check your email for confirmation.');
        // sendNotification(formData.email, formData.name, formData.date, formData.time); // Send notification

        clearTimeSlots();
        window.location.reload();
    } else {
        console.error('Error:', response.statusText);
        alert('Error booking appointment');
    }
}

function clearTimeSlots() {
    var timeSlotsContainer = document.getElementById("time-slots");
    timeSlotsContainer.innerHTML = ""; // Clear time slots container
}

function formatDate(selectedDate) {
    const [year, month, day] = selectedDate.split('-');
    return `${day}-${month}-${year}`; // Format the date as day-month-year
}

document.getElementById("appointmentForm").addEventListener("submit", submitForm);





        // Add event listener to the logout button
        document.querySelector('.logout-btn').addEventListener('click', () => {
            // Send a request to the server to destroy the session
            fetch('/logout', {
                method: 'POST'
            })
            .then(response => {
                if (response.ok) {
                    // Redirect the user to the main page after successful logout
                    window.location.href = '/main.html'; // Change '/main.html' to the appropriate main page URL
                } else {
                    console.error('Logout failed');
                }
            })
            .catch(error => console.error('Error during logout:', error));
        });


