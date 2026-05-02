const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer config for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/parking-photos/');
    },
    filename: (req, file, cb) => {
        cb(null, `PARKING_${req.params.id}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

router.get('/', protect, parkingController.getAllParkingPlaces);
router.get('/owner/:ownerId', protect, parkingController.getParkingPlacesByOwner);
router.post('/add', protect, parkingController.saveParkingPlace);
router.put('/update/:id', protect, parkingController.updateParkingPlace);
router.delete('/delete/:id', protect, parkingController.deleteParkingPlace);
router.patch('/:id/features', protect, parkingController.updateFeatureFlags);
router.post('/:id/upload-image', protect, upload.single('file'), parkingController.uploadParkingImage);

module.exports = router;
