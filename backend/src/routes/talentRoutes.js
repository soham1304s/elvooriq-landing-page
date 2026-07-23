const express = require('express');
const router = express.Router();
const talentController = require('../controllers/talentController');
const { upload } = require('../config/cloudinary');

router.get('/', talentController.getTalent);
router.post('/', upload.single('image'), talentController.addTalent);
router.delete('/:id', talentController.deleteTalent);

module.exports = router;
