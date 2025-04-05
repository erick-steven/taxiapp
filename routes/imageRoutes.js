const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const Image = require('../models/Image');
const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/images');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed!'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// @route   POST /api/images/upload
// @desc    Upload new image
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create thumbnail
    const thumbnailPath = path.join(__dirname, '../uploads/thumbnails');
    if (!fs.existsSync(thumbnailPath)) {
      fs.mkdirSync(thumbnailPath, { recursive: true });
    }

    const thumbnailName = `thumb-${req.file.filename}`;
    await sharp(req.file.path)
      .resize(300, 300)
      .toFile(path.join(thumbnailPath, thumbnailName));

    // Save to database
    const image = new Image({
      filename: req.file.filename,
      path: `/uploads/images/${req.file.filename}`,
      thumbnail: `/uploads/thumbnails/${thumbnailName}`,
      title: req.body.title,
      description: req.body.description
    });

    await image.save();
    res.json(image);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = parseInt(req.query.limit) || 12; // Default to 12 items per page
  const skip = (page - 1) * limit;

  try {
    const images = await Image.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(images);
  } catch (err) {
    console.error('Error fetching images:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});




// GET all images (for gallery)
router.get('/', async (req, res) => {
  try {
      const images = await Image.find().sort({ uploadedAt: -1 });
      res.json(images);
  } catch (error) {
      console.error('Error fetching images:', error);
      res.status(500).json({ error: 'Failed to load images' });
  }
});

// GET single image by ID
router.get('/:id', async (req, res) => {
  try {
      const image = await Image.findById(req.params.id);
      if (!image) {
          return res.status(404).json({ error: 'Image not found' });
      }
      res.json(image);
  } catch (error) {
      console.error('Error fetching image:', error);
      res.status(500).json({ error: 'Failed to load image' });
  }
});

// POST upload new image
router.post('/', async (req, res) => {
  try {
      if (!req.files || !req.files.image) {
          return res.status(400).json({ error: 'No image uploaded' });
      }

      const imageFile = req.files.image;
      const uniqueName = uuidv4() + path.extname(imageFile.name);
      const uploadPath = path.join(__dirname, '../uploads/images', uniqueName);

      await imageFile.mv(uploadPath);

      const newImage = new Image({
          filename: uniqueName,
          path: `/uploads/images/${uniqueName}`,
          title: req.body.title || 'Untitled',
          description: req.body.description || '',
          tags: req.body.tags ? req.body.tags.split(',') : []
      });

      await newImage.save();
      res.status(201).json(newImage);
  } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ error: 'Failed to upload image' });
  }
});

// DELETE image by ID
router.delete('/:id', async (req, res) => {
  try {
      const image = await Image.findByIdAndDelete(req.params.id);
      if (!image) {
          return res.status(404).json({ error: 'Image not found' });
      }

      // Delete the actual file
      const filePath = path.join(__dirname, '../uploads/images', image.filename);
      try {
          await fs.unlink(filePath);
      } catch (err) {
          console.error('Error deleting image file:', err);
      }

      res.json({ message: 'Image deleted successfully' });
  } catch (error) {
      console.error('Error deleting image:', error);
      res.status(500).json({ error: 'Failed to delete image' });
  }
});




module.exports = router;