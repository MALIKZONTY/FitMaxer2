/*
const express = require('express');
const router = express.Router();
const { generate60DayPlan } = require('../controllers/routineController');

router.post('/generate-60-day/:uid', generate60DayPlan);

router.get('/routine/all/:uid', planController.getAllRoutinePlans);

module.exports = router;
*/

const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');
const { verifyUserToken } = require('../middlewares/authMiddleware');


/*
const { verifyToken } = require('../middleware/auth'); // ✅ import middleware

// POST route to generate 60-day plan (no :uid in URL)
router.post('/generate-60-day', verifyToken, routineController.generate60DayPlan);

// GET all 60-day routine (uses token for UID)
router.get('/routine/all', verifyToken, routineController.getAllRoutinePlans);

// GET routine by date (uses token for UID)
router.get('/routine/by-date/:date', verifyToken, routineController.getRoutineByDate);
module.exports = router;
*/

// POST route to generate the 60-day plan
router.post('/generate-routine', verifyUserToken, routineController.generateRoutinePlan);

// ✅ Add this: GET route to fetch all 60-day routine data
router.get('/routine/all', verifyUserToken, routineController.getAllRoutinePlans);


router.get('/routine/by-date', verifyUserToken, routineController.getRoutineByDate);


module.exports = router;
