// const mongoose = require('mongoose');
// const slugify = require('slugify');
// const validator = require('validator');

// const tourSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: [true, 'A tour must have a name'],
//       unique: true,
//       trim: true,
//       minLength: [10, 'A tour must have 10 chrachter at least'],
//       maxLength: [40, 'A tour must have 40 chrachter as maximum'],
//     },
//     slug: String,
//     duration: {
//       type: Number,
//       required: [true, 'A tour must habe a durations'],
//     },
//     maxGroupSize: {
//       type: Number,
//       required: [true, 'A tour must have a group Size'],
//     },
//     difficulty: {
//       type: String,
//       required: [true, 'A tour must have a difficulty'],
//       enum: [
//         {
//           values: ['easy', 'medium', 'difficult'],
//           message: 'difficulty is either: easy , medium , difficulty',
//         },
//       ],
//     },
//     ratingsAverage: {
//       type: Number,
//       default: 4.5,
//       min: [0, 'ratings must be above 1.0'],
//       max: [5, 'ratings must be below 5.0'],
//       set: (val) => Math.round(val * 10) / 10,
//     },
//     ratingsQuantity: {
//       type: Number,
//       default: 0,
//     },
//     price: {
//       type: Number,
//       required: [true, 'A tour must have a price'],
//     },
//     priceDiscount: {
//       type: Number,
//       validate: {
//         validator: function (val) {
//           return val < this.price;
//         },
//         message: 'priceDiscount ({VALUE}) must be less than price',
//       },
//     },
//     summary: {
//       type: String,
//       trim: true,
//       required: true,
//     },
//     description: {
//       type: String,
//       trim: true,
//     },
//     imageCover: {
//       type: String,
//       required: [true, 'A tour must have a cover image'],
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now(),
//       select: false,
//     },
//     startDates: {
//       type: [Date],
//     },
//     images: Array,
//     secretTour: {
//       type: Boolean,
//       default: false,
//     },
//     startLocation: {
//       type: {
//         type: String,
//         default: 'Point',
//         enum: ['Point'],
//       },
//       coordinates: [Number],
//       address: String,
//       description: String,
//     },
//     locations: [
//       {
//         type: {
//           type: String,
//           default: 'Point',
//           enum: ['Point'],
//         },
//         coordinates: [Number],
//         address: String,
//         description: String,
//         day: Number,
//       },
//     ],
//     guides: [
//       {
//         type: mongoose.Schema.ObjectId,
//         ref: 'User',
//       },
//     ],
//   },
//   {
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   },
// );

// tourSchema.index({ price: 1, ratingsAverage: -1 });
// tourSchema.index({ slug: 1 });
// tourSchema.index({ startLocation: '2dsphere' });

// // virtuals propertis
// tourSchema.virtual('durationByWeek').get(function () {
//   return this.duration / 7;
// });

// //populate tour
// tourSchema.virtual('reviews', {
//   ref: 'Review',
//   foreignField: 'tour',
//   localField: '_id',
// });

// // Doc middleware : run before save() and create() not anythig else
// tourSchema.pre('save', function (next) {
//   this.slug = slugify(this.name, { lower: true });
//   next();
// });
// // tourSchema.pre('save', function (next) {
// //   console.log('will save the new document');
// //   next();
// // });
// // // after save the new doc
// // tourSchema.post('save', function (doc, next) {
// //   console.log(doc);
// //   next();
// // });

// // QUERY MIDDLEWARE
// tourSchema.pre(/^find/, function (next) {
//   if (this.getOptions().skipPopulate) return next();
//   this.populate({
//     path: 'guides',
//     select: '-__v -passwordChangedAt -email',
//   });
//   next();
// });
// // tourSchema.pre('find', function (next) {
// tourSchema.pre(/^find/, function (next) {
//   this.find({ secretTour: { $ne: true } });
//   this.start = Date.now();
//   next();
// });
// //Query took time
// tourSchema.post(/^find/, function (docs, next) {
//   // console.log(docs);
//   console.log('Query took ', Date.now() - this.start + ' milliseconds');
//   next();
// });

// // tourSchema.pre('aggregate', function (next) {
// //   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
// //   console.log(this.pipeline());
// //   next();
// // });

// const Tour = mongoose.model('Tour', tourSchema);
// module.exports = Tour;
