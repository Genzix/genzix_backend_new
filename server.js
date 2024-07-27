const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const mongoUri = process.env.MONGODB_URI;
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
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
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
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
            from: process.env.EMAIL_USER,
            to: ['teamgenzix@gmail.com', 'yerramsettydiwakar007@gmail.com', 'yvk2402@gmail.com', 'sri.angajala911@gmail.com'],
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

// Catch-all route for undefined endpoints
app.use((req, res, next) => {
    res.status(404).send("The resource you are looking for has been removed, had its name changed, or is temporarily unavailable.");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
