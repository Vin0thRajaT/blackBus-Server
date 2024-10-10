import express from "express";
import { auth } from "../middleware/auth.js";
import { adminAuth } from "../middleware/adminAuth.js";
import {
  getBuses,
  getBusDetails,
  getAvailableSeats,
  cancelBooking,
  viewUserBookings,
  createBus,
  getBusTicketDetails,
  resetBus,
  searchBuses,
  createCheckoutSession,
  confirmBooking,
  cancelTempBooking,
  tempBookSeat,
} from "../controllers/busController.js";

const router = express.Router();

// Public routes
router.get("/search", searchBuses);
router.get("/", getBuses);
router.get("/:busId", getBusDetails);
router.get("/:busId/available-seats", getAvailableSeats);

// Authenticated user routes
router.post("/temp-book", auth, tempBookSeat);
router.post("/confirm-booking", auth, confirmBooking);
router.post("/cancel-booking/:tempBookingId", auth, cancelTempBooking);
router.post("/cancel", auth, cancelBooking);
router.get("/user/bookings", auth, viewUserBookings);

// Admin routes
router.post("/create", auth, adminAuth, createBus);
router.get("/:busId/tickets", auth, adminAuth, getBusTicketDetails);
router.post("/reset", auth, adminAuth, resetBus);

router.post("/checkout-session", auth, createCheckoutSession);

export default router;
