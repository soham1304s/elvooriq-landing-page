const express = require('express');
const router = express.Router();
const creatorController = require('../controllers/creatorController');
const { upload } = require('../config/cloudinary');

router.get('/', creatorController.getCreators);
router.post('/', upload.single('image'), creatorController.addCreator);
router.delete('/:id', creatorController.deleteCreator);

module.exports = router;
