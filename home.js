document.addEventListener('DOMContentLoaded', () => {
    // Initially hide the main content
    document.querySelector('main').style.display = 'none';
    document.querySelector('header').style.display = 'none';
    document.querySelector('footer').style.display = 'none';

    fetch('/profile')
        .then(response => response.json())
        .then(data => {
            fetch('/config/admin-email')
                .then(response => response.json())
                .then(config => {
                    const navList = document.querySelector('nav ul');

                    // Clear existing list items
                    navList.innerHTML = '';

                    // Base menu item for 'Home'
                    let homeItem = '<li><a href="home.html">Home</a></li>';

                    if (data.email === config.adminEmail) {
                        // For admin
                        let adminItem1 = '<li><a href="docdashboard.html">View Patients</a></li>';
                        let adminItem2 ='<li><a href="selectappointment.html">Select Slots</a></li>';
                        navList.innerHTML = homeItem + adminItem1 +adminItem2;
                    } else {
                        // For regular users
                        let bookItem = '<li><a href="book.html">Book Appointment</a></li>';
                        let historyItem = '<li><a href="history.html">History</a></li>';
                        let contactItem = '<li><a href="contact.html">Contact</a></li>';
                        navList.innerHTML = homeItem + bookItem + historyItem + contactItem;
                    }


                    // After setting up the nav, reveal the main content
                    document.querySelector('main').style.display = '';
                    document.querySelector('header').style.display = '';
                    document.querySelector('footer').style.display = '';
                })
        })
        .catch(error => console.error('Error fetching user data:', error));
});
