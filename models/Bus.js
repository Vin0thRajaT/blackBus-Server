import mongoose from "mongoose";

const BusSchema = new mongoose.Schema({
  busName: { type: String, required: true },
  busNumber: { type: String, required: true, unique: true },
  route: { type: String, required: true },
  scheduleDate: {
    type: String,
    required: true,
  },
  scheduleTime: {
    type: String,
    required: true,
  },
  seats: { type: Number, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, required: true },
  busType: { type: String, required: true },
  amenities: [{ type: String, required: true }],
  duration: { type: String, required: true },
  availableSeats: { type: Number, required: true },
  bookedSeats: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      seatNumber: { type: Number, required: true },
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
});

export default mongoose.model("Bus", BusSchema);
