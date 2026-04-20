const router = require('express').Router();
const { register, login, getUsers, deleteUser, updatePassword } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { verifyRole } = require('../middleware/role');

router.post('/register', verifyToken, verifyRole(['admin']), register);
router.post('/register-manager', verifyToken, verifyRole(['admin']), register);
router.get('/users', verifyToken, verifyRole(['admin']), getUsers);
router.delete('/users/:id', verifyToken, verifyRole(['admin']), deleteUser);
router.put('/users/:id/password', verifyToken, verifyRole(['admin']), updatePassword);
router.post('/login', login);

module.exports = router;
