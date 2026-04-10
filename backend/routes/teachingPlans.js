const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { getPlans, getPlansByClass, getHomeworkByClass, createPlan, updatePlan, deletePlan } = require('../controllers/teachingPlanController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/plans')),
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    },
});

const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIME.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Only PDF or image files (JPG, PNG, GIF, WEBP) allowed'));
    },
    limits: { fileSize: 15 * 1024 * 1024 },
});

// Wrap multer so any error (bad file type, size limit) returns JSON not HTML
const handleUpload = (req, res, next) => {
    upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'image', maxCount: 1 }])(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        next();
    });
};

router.get('/', getPlans);
router.get('/class/:class_id/homework', getHomeworkByClass);
router.get('/class/:class_id', getPlansByClass);
router.post('/', handleUpload, createPlan);
router.put('/:id', handleUpload, updatePlan);
router.delete('/:id', deletePlan);

module.exports = router;
