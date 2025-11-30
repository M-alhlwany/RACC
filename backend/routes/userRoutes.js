const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');

router.post('/signup', authController.signup);
router.get('/confirmEmail/:token', authController.confirmEmail);
router.post('/login', authController.login);
router.get('/logout', authController.protect, authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//use protect middleware for all the following routes
router.use(authController.protect);

//updatePassword
router.patch('/updateMyPassword', authController.updateMyPassword);

router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe,
);
router.delete('/deleteMe', userController.deleteMe);

router.route('/me').get(userController.getMe, userController.getOneUser);

//restrict To Admin Only
router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getOneUser)
  .patch(userController.updateOneUer)
  .delete(userController.deleteOneUser);
module.exports = router;
