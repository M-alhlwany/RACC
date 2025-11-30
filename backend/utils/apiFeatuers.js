class APIFeatures {
  constructor(query, queryUrl) {
    // query = Tour.find()
    this.query = query;
    // queryUrl = req.query
    this.queryUrl = queryUrl;
  }
  filter() {
    const queryObj = { ...this.queryUrl };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // deleting Fields
    excludedFields.forEach((el) => delete queryObj[el]);
    // convert queryObj to String
    let queryStr = JSON.stringify(queryObj);
    // Adding $ opreator to the query
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // Buliding Query
    // Tour.find().find()
    this.query = this.query.find(JSON.parse(queryStr));
    // return the Obj
    return this;
  }

  sort() {
    if (this.queryUrl.sort) {
      const sortBy = this.queryUrl.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    // return the Obj
    return this;
  }

  limitFields() {
    // 4) Field limiting
    if (this.queryUrl.fields) {
      const fields = this.queryUrl.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // exclude __v field
    }
    // return the Obj
    return this;
  }

  // 3) Pagination
  paginate() {
    const page = this.queryUrl.page * 1 || 1; // convert to number
    const limit = this.queryUrl.limit * 1 || 100; // convert to number
    const skip = (page - 1) * limit;

    // if page field existing the page or limit must be greater than 0
    // if (this.queryUrl.page) {
    //   if (this.queryUrl.page * 1 < 1 || this.queryUrl.limit * 1 < 1) {
    //     throw new Error('page and limit must be greater than 0');
    //   }
    //   this.query = this.query.skip(skip).limit(limit);
    // }
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;
