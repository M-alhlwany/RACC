const express = require('express');
const router = express.Router();
const tourController = require('./../controller/tourController');
const authController = require('./../controller/authController');
// const reviewRoutes = require('./reviewRoutes');

//acts like ('/') at reviews (router.route('/').post())
// router.use('/:tourId/reviews', reviewRoutes);

// Special routes
router
  .route('/top-5-cheap')
  .get(tourController.getTop5CheapTours, tourController.getAlltours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/tour-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getTourWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

// Tours routes(.../api/v1/tours)
router.route('/').get(tourController.getAlltours).post(
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  // tourController.uploadTourPhoto,
  // tourController.resizeTourPhoto,
  tourController.createOneTour
);

router
  .route('/:id')
  .get(authController.protect, tourController.getOneTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourPhoto,
    tourController.resizeTourPhoto,
    tourController.upDateOneTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteOneTour
  );

router
  .route('/edit/:id')
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourPhoto,
    tourController.resizeTourPhoto,
    tourController.upDateOneTour
  );
module.exports = router;
