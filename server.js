const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();
const PORT = 4000;

// Replace these with your actual credentials and connection string
const MONGODB_URI = "mongodb+srv://teamgenzix:ITDSteeIc30cmM5t@cluster0.0s02h1h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const EMAIL_USER = "thegenzix@gmail.com";
const EMAIL_PASS = "nwzl avov smlw drkk";

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

// Define the schema and model for form submissions
const formSchema = new mongoose.Schema({
    name: String,
    email: String,
    company: String,
    services: String,
    phoneno: String,
    message: String,
    date: {
        type: Date,
        default: Date.now
    }
});

const Form = mongoose.model("Form", formSchema);

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

// API endpoint to handle form submissions
app.post('/submitFormToMongoDB', async (req, res) => {
    const { name, email, company, services, phoneno, message } = req.body;

    try {
        const newForm = new Form({
            name,
            email,
            company,
            services,
            phoneno,
            message
        });

        const savedForm = await newForm.save();

        // Send email notification
        const mailOptions = {
            from: EMAIL_USER,
            to: ['teamgenzix@gmail.com', 'yerramsettydiwakar007@gmail.com'],
            subject: 'New Form Submission',
            text: `New form submission:
                Name: ${name}
                Email: ${email}
                Company: ${company}
                Services: ${services}
                Phoneno: ${phoneno}
                Message: ${message}
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        res.status(200).json({ success: true, data: savedForm });
    } catch (error) {
        console.error("Error saving form data to MongoDB:", error);
        res.status(500).json({ success: false, error: "Failed to save form data." });
    }
});

// Root URL route to show a message in the browser
app.get('/', (req, res) => {
    res.send(`Server is running on http://localhost:${PORT}`);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
