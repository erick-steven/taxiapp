const express = require('express');
const multer = require('multer');
const Image = require('../models/Image');
const router = express.Router();

// Set up storage configuration for multer
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});




router.get('/upload', (req, res) => {
    res.render('upload'); // Render the upload.ejs form
});

// Initialize multer with the specified storage
const upload = multer({ storage });

// Route for uploading an image
router.post('/upload', upload.single('image'), async(req, res) => {
    try {
        const image = new Image({
            filename: req.file.filename,
            path: '/uploads/' + req.file.filename
        });
        await image.save();
        res.redirect('/'); // Redirect to root route to display the updated gallery
    } catch (error) {
        console.error(error);
        res.status(500).send('Error uploading image');
    }
});
// Route for rendering the gallery
router.get('/', async(req, res) => {
    try {
        const images = await Image.find(); // Retrieve all images from the database
        res.render('index', { images }); // Pass the images to the index.ejs view
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading gallery');
    }
});

module.exports = router;