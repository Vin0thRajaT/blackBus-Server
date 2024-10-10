import Bus from "../models/Bus.js";
import Booking from "../models/Booking.js";

// Get all buses
export const getBuses = async (req, res) => {
  try {
    const buses = await Bus.find();
    console.log(buses);
    res.json(buses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get bus details by ID
export const getBusDetails = async (req, res) => {
  try {
    const bus = await Bus.findOne({ busNumber: req.params.busId });

    if (!bus) {
      return res.status(404).json({ msg: "Bus not found" });
    }

    res.json(bus);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// View available seats
export const getAvailableSeats = async (req, res) => {
  try {
    const bus = await Bus.findOne({ busNumber: req.params.busId });

    if (!bus) {
      return res.status(404).json({ msg: "Bus not found." });
    }

    const totalSeats = bus.seats;

    const bookedSeats = bus.bookedSeats.map((seat) => seat.seatNumber);

    const availableSeats = [];
    for (let i = 1; i <= totalSeats; i++) {
      if (!bookedSeats.includes(i)) {
        availableSeats.push(i);
      }
    }

    res.json({ availableSeats });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

export const bookSeat = async (req, res) => {
  const { busId, seatDetails } = req.body; // Expect seatDetails to include seatNumbers and passenger info
  console.log("Received seatDetails:", seatDetails); // Debugging line

  if (!seatDetails || seatDetails.length === 0) {
    return res.status(400).json({ msg: "No seat details provided" });
  }

  try {
    const bus = await Bus.findOne({ busNumber: busId });
    if (!bus) return res.status(404).json({ msg: "Bus not found" });

    const availableSeats = bus.availableSeats;

    // Check for already booked seats
    const unavailableSeats = seatDetails
      .map((detail) => detail.seatNumber)
      .filter((seatNumber) =>
        bus.bookedSeats.some((seat) => seat.seatNumber === seatNumber)
      );

    if (unavailableSeats.length > 0) {
      return res
        .status(400)
        .json({ msg: `Seats ${unavailableSeats.join(", ")} already booked` });
    }

    if (seatDetails.length > availableSeats) {
      return res.status(400).json({ msg: "Not enough seats available" });
    }

    // Add seat bookings with passenger details
    seatDetails.forEach((detail) => {
      bus.bookedSeats.push({
        user: req.user.id,
        seatNumber: detail.seatNumber,
        passengerName: detail.passengerName,
        passengerAge: detail.passengerAge,
        passengerGender: detail.passengerGender,
      });
    });

    // Update available seats
    bus.availableSeats -= seatDetails.length;
    await bus.save();

    // Save the booking in a separate Booking schema
    const booking = new Booking({
      user: req.user.id,
      bus: bus.id,
      seatNumbers: seatDetails.map((detail) => detail.seatNumber),
    });
    console.log(booking);
    await booking.save();

    res.json({ msg: "Booking successful", bus });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Cancel a booking
export const cancelBooking = async (req, res) => {
  const { bookingId } = req.body; // Receive booking ID from frontend

  try {
    // Find the booking by ID
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    // Find the bus related to the booking
    const bus = await Bus.findById(booking.bus);
    if (!bus) return res.status(404).json({ msg: "Bus not found" });

    // Remove the booked seats from the bus
    const bookedSeatsToFree = booking.seatNumbers;
    bus.bookedSeats = bus.bookedSeats.filter(
      (seat) => !bookedSeatsToFree.includes(seat.seatNumber)
    );

    // Increase available seats by the number of seats canceled
    bus.availableSeats += bookedSeatsToFree.length;

    // Save the updated bus data
    await bus.save();

    // Delete the booking
    await Booking.findByIdAndDelete(bookingId);

    res.json({ msg: "Booking canceled successfully", bus });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// View user bookings
export const viewUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate(
      "bus",
      "busNumber busName route schedule"
    );
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Admin: Create a bus
export const createBus = async (req, res) => {
  const {
    busNumber,
    busName,
    route,
    scheduleDate,
    scheduleTime,
    fromCity,
    toCity,
    seats,
    price,
    busType,
    amenities,
    duration,
    rating,
  } = req.body;
  try {
    const newBus = new Bus({
      busName,
      busNumber,
      route,
      scheduleDate,
      scheduleTime,
      fromCity,
      toCity,
      seats,
      price,
      busType,
      amenities,
      rating,
      duration,
      availableSeats: seats,
    });
    await newBus.save();
    res.json(newBus);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Admin: View bus ticket details
export const getBusTicketDetails = async (req, res) => {
  try {
    const bus = await Bus.findOne({ busNumber: req.params.busId }).populate({
      path: "bookedSeats.user",
      select: "name email",
    });

    if (!bus) return res.status(404).json({ msg: "Bus not found" });

    const ticketDetails = bus.bookedSeats.map((booking) => ({
      userName: booking.user.name,
      userEmail: booking.user.email,
      seatNumber: booking.seatNumber,
      passengerName: booking.passengerName,
      passengerAge: booking.passengerAge,
      passengerGender: booking.passengerGender,
    }));

    console.log(ticketDetails);

    res.json(ticketDetails);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Admin: Reset a bus
export const resetBus = async (req, res) => {
  try {
    const { busNumber } = req.body;
    const bus = await Bus.findOne({ busNumber: busNumber });
    if (!bus) return res.status(404).json({ msg: "Bus not found" });

    bus.bookedSeats = [];
    bus.availableSeats = bus.seats; // Reset available seats to total seats
    await bus.save();

    res.json({ msg: "Bus reset successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

export const searchBuses = async (req, res) => {
  const { fromCity, toCity, date } = req.query;

  try {
    const query = {
      fromCity,
      toCity,
      scheduleDate: date,
    };
    const buses = await Bus.find(query);

    if (buses.length === 0) {
      return res
        .status(404)
        .json({ msg: "No buses found for the given criteria" });
    }

    res.json(buses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
