const express = require('express');
const multer = require('multer');
const path = require('path');
const { 
    addVehicle, 
    getUserVehicles, 
    getVehicleById, 
    updateVehicle, 
    deleteVehicle 
} = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/vehicle-docs/');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetypes = /image\/jpeg|image\/jpg|image\/png|image\/webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = mimetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Error: Images only! (jpeg, jpg, png, webp)');
        }
    }
});

const cpUpload = upload.fields([
    { name: 'vehicleImage', maxCount: 1 },
    { name: 'licenseImage', maxCount: 1 }
]);

router.post('/', protect, cpUpload, addVehicle);
router.get('/', protect, getUserVehicles);
router.get('/:id', protect, getVehicleById);
router.put('/:id', protect, cpUpload, updateVehicle);
router.delete('/:id', protect, deleteVehicle);

module.exports = router;
