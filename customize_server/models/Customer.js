import mongoose from 'mongoose';
import validator from 'validator';

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a customer name'],
      maxlength: [100, 'Name cannot be more than 100 characters'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please provide a phone number'],
      trim: true,
    },
    business_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Please provide a business ID'],
    },
    location_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'Please provide a location ID'],
    },
    rewards: {
      type: Number,
      default: 0,
      min: [0, 'Rewards cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    last_order_at: {
      type: Date,
      default: null,
    },
    preferences: {
      dietary: [{
        type: String,
        enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher']
      }],
      allergies: [String],
      favoriteItems: [String],
      specialInstructions: String,
    },
    addresses: [{
      type: {
        type: String,
        enum: ['home', 'work', 'other'],
        default: 'home'
      },
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      isDefault: {
        type: Boolean,
        default: false
      }
    }],
    loyaltyTier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze'
    },
    totalOrders: {
      type: Number,
      default: 0,
      min: 0
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot be more than 500 characters'],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Middleware to filter out inactive customers by default
customerSchema.pre(/^find/, function(next) {
  this.find({ isActive: { $ne: false } });
  next();
});

// Method to update last order date
customerSchema.methods.updateLastOrder = function() {
  this.last_order_at = new Date();
  this.totalOrders += 1;
  return this.save({ validateBeforeSave: false });
};

// Method to add rewards
customerSchema.methods.addRewards = function(points) {
  this.rewards += points;
  return this.save({ validateBeforeSave: false });
};

// Method to redeem rewards
customerSchema.methods.redeemRewards = function(points) {
  if (this.rewards < points) {
    throw new Error('Insufficient rewards points');
  }
  this.rewards -= points;
  return this.save({ validateBeforeSave: false });
};

// Method to update loyalty tier based on total spent
customerSchema.methods.updateLoyaltyTier = function() {
  if (this.totalSpent >= 1000) {
    this.loyaltyTier = 'platinum';
  } else if (this.totalSpent >= 500) {
    this.loyaltyTier = 'gold';
  } else if (this.totalSpent >= 200) {
    this.loyaltyTier = 'silver';
  } else {
    this.loyaltyTier = 'bronze';
  }
  return this.save({ validateBeforeSave: false });
};

// Static method to find customers by business
customerSchema.statics.findByBusiness = function(businessId) {
  return this.find({ business_id: businessId });
};

// Static method to find customers by location
customerSchema.statics.findByLocation = function(locationId) {
  return this.find({ location_id: locationId });
};

// Static method to get top customers by rewards
customerSchema.statics.getTopCustomersByRewards = function(limit = 10) {
  return this.find().sort({ rewards: -1 }).limit(limit);
};

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
