import mongoose from 'mongoose';
import validator from 'validator';

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a business name'],
      maxlength: [100, 'Business name cannot be more than 100 characters'],
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    address: {
      street: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      zipCode: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
      },
    },
    logo: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Middleware to filter out inactive businesses by default
businessSchema.pre(/^find/, function(next) {
  this.find({ isActive: { $ne: false } });
  next();
});

const Business = mongoose.model('Business', businessSchema);

export default Business;
