const express = require('express');
const router = express.Router();
const creationController = require('../controllers/creationController');
const authorize = require('../middlewares/rbac');

// Public Discovery / Feed
router.get('/', creationController.getCreations);
router.get('/:id', creationController.getCreation);

// Creator Content Actions
router.post('/', authorize(['CREATOR', 'ADMIN']), creationController.createCreation);
router.post('/:id/like', authorize(), creationController.toggleLike);
router.post('/:id/comments', authorize(), creationController.addComment);
router.post('/:id/tip', authorize(), creationController.sendTip);

// Creator Memberships
router.get('/creators/:creatorId/tiers', creationController.getCreatorTiers);
router.post('/tiers', authorize(['CREATOR', 'ADMIN']), creationController.createMembershipTier);

module.exports = router;
