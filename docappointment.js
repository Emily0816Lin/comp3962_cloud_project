document
  .getElementById("slot-specification-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const slotDate = document.getElementById("slot-date").value;
    const slotTime = document.getElementById("slot-time").value;

    // Parse the date
    const parsedDate = new Date(slotDate);

    // Get day, month, and year components
    const day = parsedDate.getDate() + 1;
    const month = parsedDate.getMonth() + 1; // January is 0
    const year = parsedDate.getFullYear();

    const dayFormatted = String(day).padStart(2, "0");
    const monthFormatted = String(month).padStart(2, "0");

    // Construct the formatted date string
    const formattedDate = `${dayFormatted}-${monthFormatted}-${year}`;

    let [hours, minutes] = slotTime.split(":").map((num) => parseInt(num, 10));

    // Round minutes to the nearest 30-minute mark
    minutes = Math.round(minutes / 30) * 30;
    if (minutes === 60) {
      minutes = 0;
      hours += 1;
    }

    // Calculate end time (30 minutes later)
    let endHours = hours;
    let endMinutes = minutes + 30;
    if (endMinutes >= 60) {
      endMinutes -= 60;
      endHours += 1;
    }

    // Convert to 12-hour format and format for display
   // const startPeriod = hours >= 12 ? "PM" : "AM";
    const endPeriod = endHours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    endHours = endHours % 12 || 12;

    const formattedStartTime = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}`;
    const formattedEndTime = `${String(endHours).padStart(2, "0")}:${String(
      endMinutes
    ).padStart(2, "0")} ${endPeriod}`;

    // // Display the time slot
    // document.getElementById(
    //   "time-slot-display"
    // ).textContent = `${formattedStartTime} - ${formattedEndTime}`;
    // Assuming you have an endpoint to add slots
    fetch("/addSlot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date: formattedDate, time: `${formattedStartTime} - ${formattedEndTime}` }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Slot added:", data);
        alert("Slot added successfully!");
      })
      .catch((error) => {
        console.error("Error adding slot:", error);
      });
  });





