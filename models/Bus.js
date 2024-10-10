import mongoose from "mongoose";

const BusSchema = new mongoose.Schema(
  {
    busName: {
      type: String,
      required: true,
    },
    busNumber: {
      type: String,
      required: true,
      unique: true,
    },
    route: {
      type: String,
      required: true,
    },
    scheduleDate: {
      type: String,
      required: true,
    },
    scheduleTime: {
      type: String,
      required: true,
    },
    seats: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    busType: {
      type: String,
      required: true,
    },
    amenities: [
      {
        type: String,
        required: true,
      },
    ],
    duration: {
      type: String,
      required: true,
    },
    availableSeats: {
      type: Number,
      required: true,
    },
    bookedSeats: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        seatNumber: {
          type: Number,
          required: true,
        },
        passengerName: {
          type: String,
          required: true,
        },
        passengerAge: {
          type: Number,
          required: true,
        },
        passengerGender: {
          type: String,
          enum: ["Male", "Female", "Other"],
          required: true,
        },
        status: {
          type: String,
          required: true,
        },
      },
    ],
    fromCity: {
      type: String,
      required: true,
    },
    toCity: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

export default mongoose.model("Bus", BusSchema);
