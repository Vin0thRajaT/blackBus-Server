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

export const confirmBooking = async (req, res) => {
  const { tempBookingId } = req.body;

  if (!tempBookingId) {
    return res.status(400).json({ msg: "Temporary booking ID is required" });
  }

  try {
    const booking = await Booking.findById(tempBookingId);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    // Check if booking is already confirmed
    if (booking.status === "confirmed") {
      return res.status(400).json({ msg: "Booking is already confirmed" });
    }

    const bus = await Bus.findById(booking.bus);
    if (!bus) return res.status(404).json({ msg: "Bus not found" });

    // Ensure that the seatNumbers from booking are available
    const seatNumbers = booking.seatNumbers;
    if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res
        .status(400)
        .json({ msg: "No seat numbers found in the booking." });
    }

    // Update existing booked seats with confirmed status
    seatNumbers.forEach((seatNumber) => {
      const bookedSeat = bus.bookedSeats.find(
        (seat) => seat.seatNumber === seatNumber
      );

      if (!bookedSeat) {
        throw new Error(`Seat number ${seatNumber} not found in booked seats.`);
      }

      // Update passenger details and set status to confirmed
      bookedSeat.user = req.user.id; // You may want to ensure this is set
      bookedSeat.status = "confirmed"; // Set status to confirmed
    });

    // Mark booking as confirmed
    booking.status = "confirmed";
    await booking.save();
    await bus.save();

    res.json({
      msg: "Booking confirmed successfully",
      bookingId: booking._id,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

export const tempBookSeat = async (req, res) => {
  const { busId, seatDetails } = req.body;

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

    // Add temporary seat bookings with passenger details
    seatDetails.forEach((detail) => {
      bus.bookedSeats.push({
        user: req.user.id,
        seatNumber: detail.seatNumber,
        passengerName: detail.passengerName, // Ensure this field is included in seatDetails
        passengerAge: detail.passengerAge, // Ensure this field is included in seatDetails
        passengerGender: detail.passengerGender, // Ensure this field is included in seatDetails
        status: "temporary", // Mark as temporary booking
      });
    });

    // Update available seats
    bus.availableSeats -= seatDetails.length;

    // Save the updated bus
    await bus.save();

    // Save the booking temporarily in the Booking collection
    const temporaryBooking = new Booking({
      user: req.user.id,
      bus: bus.id,
      seatNumbers: seatDetails.map((detail) => detail.seatNumber),
      status: "temporary", // Mark as temporary
      passengerDetails: seatDetails, // Save passenger details for confirmation later
    });

    await temporaryBooking.save();

    res.json({
      msg: "Temporary booking successful",
      tempBookingId: temporaryBooking._id,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

export const cancelTempBooking = async (req, res) => {
  const { tempBookingId } = req.params;

  if (!tempBookingId) {
    return res.status(400).json({ msg: "Temporary booking ID is required" });
  }

  try {
    const booking = await Booking.findById(tempBookingId);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    // Remove booked seats
    const bus = await Bus.findById(booking.bus);
    if (!bus) return res.status(404).json({ msg: "Bus not found" });

    // Update bookedSeats in the bus by filtering out the canceled seats
    bus.bookedSeats = bus.bookedSeats.filter(
      (seat) => !booking.seatNumbers.includes(seat.seatNumber)
    );

    // Update available seats
    bus.availableSeats += booking.seatNumbers.length;

    // Delete temporary booking
    await Booking.deleteOne({ _id: tempBookingId }); // Use deleteOne instead of remove
    await bus.save();

    res.json({ msg: "Booking canceled successfully" });
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

    // Reset bookedSeats and availableSeats
    bus.bookedSeats = [];
    bus.availableSeats = bus.seats; // Reset available seats to total seats
    await bus.save();

    // Remove bookings associated with this bus
    await Booking.deleteMany({ bus: bus._id });

    res.json({ msg: "Bus reset successfully and associated bookings removed" });
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

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Make sure you have this in your .env file

// Function to create a payment intent
export const createCheckoutSession = async (req, res) => {
  try {
    const { amount, bookingId, returnUrl } = req.body; // amount should be in rupees

    // Validate inputs
    if (!amount || !bookingId || !returnUrl) {
      return res.status(400).json({
        error: "Amount, booking ID, and return URL are required.",
      });
    }

    // Convert rupees to paise
    const amountInPaise = amount * 100;

    // Create a new Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Bus Ticket", // Change to dynamic product name if necessary
            },
            unit_amount: amountInPaise,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: returnUrl + "?success=true&bookingId=" + bookingId,
      cancel_url: returnUrl + "?cancel=true",
      metadata: {
        bookingId: bookingId, // Track the booking ID if needed
      },
    });

    // Respond with the session URL
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Payment error:", error);

    // Send back a more descriptive error message if possible
    let errorMessage;
    if (error.type === "StripeCardError") {
      errorMessage = "Your card was declined.";
    } else {
      errorMessage = error.message || "An unexpected error occurred.";
    }

    res.status(500).json({ error: errorMessage });
  }
};
