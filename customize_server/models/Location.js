import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a location name'],
      maxlength: [100, 'Location name cannot be more than 100 characters'],
      trim: true,
    },
    business_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Please provide a business ID'],
    },
    address: {
      street: {
        type: String,
        required: [true, 'Please provide a street address'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'Please provide a city'],
        trim: true,
      },
      state: {
        type: String,
        required: [true, 'Please provide a state'],
        trim: true,
      },
      zipCode: {
        type: String,
        required: [true, 'Please provide a zip code'],
        trim: true,
      },
      country: {
        type: String,
        default: 'US',
        trim: true,
      },
    },
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180,
      },
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    operatingHours: {
      monday: { open: String, close: String, closed: { type: Boolean, default: false } },
      tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
      wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
      thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
      friday: { open: String, close: String, closed: { type: Boolean, default: false } },
      saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
      sunday: { open: String, close: String, closed: { type: Boolean, default: false } },
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

// Middleware to filter out inactive locations by default
locationSchema.pre(/^find/, function(next) {
  this.find({ isActive: { $ne: false } });
  next();
});

const Location = mongoose.model('Location', locationSchema);

export default Location;
