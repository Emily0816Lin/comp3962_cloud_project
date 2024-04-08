require("dotenv").config();
const express = require('express');
var AWS = require("aws-sdk");
const bodyParser = require('body-parser');
const session = require('express-session');
const nodemailer = require('nodemailer');
const app = express();
const { CognitoIdentityServiceProvider } = require('aws-sdk'); // Import CognitoIdentityServiceProvider from AWS SDK
const port = process.env.PORT || 3000;


app.use(bodyParser.json());

let awsConfig = {
    "region": "us-west-2",
    "accessKeyId": process.env.ACCESS_KEY_ID,
    "secretAccessKey": process.env.SECRET_ACCESS_KEY
};
    

AWS.config.update(awsConfig);
let docClient = new AWS.DynamoDB.DocumentClient();

// Create a new SES object
const ses = new AWS.SES({ apiVersion: "2010-12-01" });

// Create a new CognitoIdentityServiceProvider object
const cognito = new AWS.CognitoIdentityServiceProvider();

const ADMIN_EMAIL = 'eschedulerapp@gmail.com';

// var params = {
//     TableName: "appointment",
    
// };

app.use(express.static(__dirname));
// Session middleware
app.use(session({
    secret: process.env.SESSION_KEY, // Change this to a random, secure value
    resave: false,
    saveUninitialized: true
}));

// DynamoDB Operations: Read all Items for history page
const readAllItems = async () => {
    const params = {
        TableName: "patient2"
    };

    try {
        const { Items = [] } = await docClient.scan(params).promise();
        return { success: true, data: Items };
    } catch (error) {
        return { success: false, data: null };
    }
};

// Update Items
const updateItem = async (data = {}) => {
    console.log('data:', data);
    console.log('item name:', data.name);
    console.log('item email:', data.email);

    const params = {
        TableName: 'patient2',
        Key: {
            userID: data.userID,
            entryID: data.entryID
        },
        UpdateExpression: 'SET #doctorcomment = :newDoctorComment, #prescription = :newPrescription, #status = :newStatus',
        ExpressionAttributeNames: {
            '#doctorcomment': 'doctorcomment',
            '#prescription': 'prescription',
            '#status': 'status'
        },
        ExpressionAttributeValues: {
            ':newDoctorComment': data.doctorcomment,
            ':newPrescription': data.prescription,
            ':newStatus': data.status
        }
    };

    try {
        const response = await docClient.update(params).promise();
        return { success: true, item: response.Attributes }; // Return the updated attributes
    } catch (error) {
        console.error("Error updating item:", error);
        return { success: false, data: null };
    }
};

// Endpoint to get admin email
app.get('/config/admin-email', (req, res) => {
    res.json({ adminEmail: ADMIN_EMAIL });
});

// Read all Items
app.get("/history/api/items", async (req, res) => {
    const { success, data } = await readAllItems();

    if (success) {
        return res.json({ success, data });
    }
    return res.status(500).json({ success: false, message: "Error" });
});

// Update Item
app.post("/history/api/item", async (req, res) => {
    console.log("Received request:", req.body);  // Log the incoming request body

    const { success, data } = await updateItem(req.body);

    if (success) {
        return res.json({ success, data });
    }
    return res.status(500).json({ success: false, message: 'Error' });
});

app.get('/slots', (req, res) => {
    const date = req.query.date;
    const params = {
        TableName: "appointment",
    };

    // Check if date is provided as query parameter
    if (!date) {
        return res.status(400).json({ error: 'Date parameter is required' });
    }

    docClient.scan(params, (err, data) => {
        if (err) {
            console.error('Unable to read items. Error JSON:', JSON.stringify(err, null, 2));
            res.status(500).send('Internal Server Error');
        } else {
            console.log('Data received from database:', data);
            
            // Filter the data based on the provided date
            const filteredItems = data.Items.filter(item => item.date === date);
            console.log('Filtered items:', filteredItems);
            
            res.json(filteredItems);
        }
    });
});


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/main.html');
});

// Sign-up endpoint
app.post('/signup', async (req, res) => {
    const { name, password, email } = req.body;

    const params = {
        ClientId: process.env.COGNITO_CLIENT_ID, // Your Cognito app client ID
        Username: email,
        Password: password,
        UserAttributes: [
            { Name: 'email', Value: email },
            { Name: 'name', Value: name }
            // Add any additional attributes if required
        ]
    };

    try {
        // Sign up the user
        const data = await cognito.signUp(params).promise();

        console.log('User signed up successfully:', data);

        req.session.user = { name, email };
        // Redirect the user to the home.html page
        res.redirect('/verification.html');
    } catch (error) {
        console.error('Error signing up user:', error);
        res.status(500).json({ success: false, error: 'Error signing up user: ' + error.message });
    }
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const params = {
        AuthFlow: 'USER_PASSWORD_AUTH', // Specify the authentication flow
        ClientId: process.env.COGNITO_CLIENT_ID, // Your Cognito app client ID
        AuthParameters: {
            'USERNAME': email,
            'PASSWORD': password
        }
    };

    try {
        // Authenticate the user
        const data = await cognito.initiateAuth(params).promise();

        console.log('User authenticated successfully:', data);

        // Fetch user attributes
        const getUserParams = {
            AccessToken: data.AuthenticationResult.AccessToken // Access token obtained after authentication
        };

        const userData = await cognito.getUser(getUserParams).promise();

        // Extract the user's name from the response
        const name = userData.UserAttributes.find(attr => attr.Name === 'name').Value;

        // Store user information in the session
        req.session.user = { name, email };

        // Redirect the user to the home.html page
        res.redirect('/home.html');
    } catch (error) {
        console.error('Error authenticating user:', error);
        res.status(401).json({ success: false, error: 'Error authenticating user: ' + error.message });
    }
});


// Verification endpoint
app.post('/verify', async (req, res) => {
    const { email, verificationCode } = req.body;

    const params = {
        ClientId: process.env.COGNITO_CLIENT_ID, // Your Cognito app client ID
        Username: email,
        ConfirmationCode: verificationCode
    };

    try {
        // Confirm user's email address
        await cognito.confirmSignUp(params).promise();

        console.log('User email confirmed successfully');

        res.json({ success: true, message: 'Email confirmed successfully. You can now log in.' });

    
    } catch (error) {
        console.error('Error confirming email:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

app.post('/bookAppointment', async (req, res) => {
    const { name, email, date, time } = req.body;

    if (!name || !email || !date || !time) {
        return res.status(400).json({ error: 'Name, email, date, and time are required' });
    }

    const entryId = Date.now().toString();
    const params = {
        TableName: 'patient2',
        Item: {
            userID : email,
            entryID: entryId,
            name: name,
            email: email,
            date: date,
            doctorcomment: "", // Empty string for doctor comment
            prescription: "", // Empty string for prescription
            status: "coming", // Default status
            time: time
        }
    };

    try {
        await docClient.put(params).promise();

        console.log('Added appointment to DynamoDB');

        // Update the availability of the selected time slot
        const updateParams = {
            TableName: 'appointment',
            Key: {
                date: date,
                time: time
            },
            UpdateExpression: 'SET #available = :newValue',
            ExpressionAttributeNames: {
                '#available': 'Available'
            },
            ExpressionAttributeValues: {
                ':newValue': 'no'
            }
        };

        await docClient.update(updateParams).promise();

        console.log('Time slot availability updated');

        // Send email notification
        const emailParams = {
            Destination: {
                ToAddresses: [email] // recipient email address
            },
            Message: {
                Body: {
                    Text: {
                        Data: `Hello ${name}, your appointment for ${date} at ${time} has been booked successfully.`
                    }
                },
                Subject: {
                    Data: 'Appointment Confirmation'
                }
            },
            Source: 'eschedulerapp@gmail.com' // sender email address
        };

        await ses.sendEmail(emailParams).promise();

        console.log('Email notification sent');

        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
app.get('/profile', (req, res) => {
    // Check if user is logged in (i.e., if user information is stored in the session)
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Fetch user information from the session
    const { name, email } = req.session.user;

    // Now you can use the fetched data as needed
    res.json({ name, email });
});

// Logout endpoint
app.post('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        } else {
            console.log('Session destroyed');
            res.sendStatus(200); // Send success response
        }
    });
});

app.post("/addSlot", async (req, res) => {
  const { date, time } = req.body;

  // Assuming you have a DynamoDB table for slots named 'appointmentSlots'
  const params = {
    TableName: "appointment", // Make sure to replace this with your actual table name
    Item: {
      date: date,
      time: time,
      Available: "yes", // Mark the slot as available for booking
    },
  };

  try {
    await docClient.put(params).promise();
    console.log("Slot added to the database:", params.Item);
    res.json({ success: true, message: "Slot added successfully." });
  } catch (error) {
    console.error("Failed to add slot:", error);
    res.status(500).json({ success: false, message: "Failed to add slot." });
  }
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});