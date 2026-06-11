const router = require('express').Router();
const { getMatches, getMatch } = require('../controllers/matchController');

router.get('/', getMatches);
router.get('/:id', getMatch);

module.exports = router;
