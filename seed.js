import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Bus from "./models/Bus.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await User.deleteMany();
    await Bus.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash("admin123", salt);
    const userPassword = await bcrypt.hash("user123", salt);

    const adminUser = new User({
      name: "Admin User",
      email: "admin@example.com",
      password: adminPassword,
      role: "admin",
    });

    const normalUser = new User({
      name: "Normal User",
      email: "user@example.com",
      password: userPassword,
      role: "user",
    });

    await adminUser.save();
    await normalUser.save();

    const buses = [
      {
        busName: "Rathimeena Travels",
        busNumber: "BUS001",
        route: "Thanjavur to Bangalore",
        scheduleDate: "2024-10-01",
        scheduleTime: "10:00",
        seats: 40,
        price: 1000,
        availableSeats: 40,
        fromCity: "Thanjavur",
        toCity: "Bangalore",
        busType: "Sleeper",
        amenities: ["AC", "Wi-Fi", "Charging Port"],
        rating: 4.5,
        duration: "8 hours",
      },
      {
        busName: "Sri Srinivasa",
        busNumber: "BUS002",
        route: "Chennai to Bangalore",
        scheduleDate: "2024-10-01",
        scheduleTime: "12:00",
        seats: 30,
        price: 960,
        availableSeats: 30,
        fromCity: "Chennai",
        toCity: "Bangalore",
        busType: "Semi-Sleeper",
        amenities: ["AC", "Water Bottle"],
        rating: 4.0,
        duration: "6 hours",
      },
      {
        busName: "Jabbar Travels",
        busNumber: "BUS003",
        route: "Thanjavur to Chennai",
        scheduleDate: "2024-10-01",
        scheduleTime: "14:00",
        seats: 50,
        price: 710,
        availableSeats: 50,
        fromCity: "Thanjavur",
        toCity: "Chennai",
        busType: "Non-AC",
        amenities: ["Charging Port"],
        rating: 3.8,
        duration: "5 hours",
      },
      {
        busName: "KPN Travels",
        busNumber: "BUS004",
        route: "Madurai to Coimbatore",
        scheduleDate: "2024-10-01",
        scheduleTime: "09:00",
        seats: 40,
        price: 950,
        availableSeats: 25,
        fromCity: "Madurai",
        toCity: "Coimbatore",
        busType: "Sleeper",
        amenities: ["AC", "Wi-Fi", "Snacks"],
        rating: 4.7,
        duration: "7 hours",
      },
      {
        busName: "SRS Travels",
        busNumber: "BUS005",
        route: "Bangalore to Mysore",
        scheduleDate: "2024-10-01",
        scheduleTime: "15:00",
        seats: 35,
        price: 800,
        availableSeats: 20,
        fromCity: "Bangalore",
        toCity: "Mysore",
        busType: "Semi-Sleeper",
        amenities: ["AC", "Blanket"],
        rating: 4.2,
        duration: "3 hours",
      },
      {
        busName: "VRL Travels",
        busNumber: "BUS006",
        route: "Hubli to Bangalore",
        scheduleDate: "2024-10-01",
        scheduleTime: "18:00",
        seats: 45,
        price: 1200,
        availableSeats: 10,
        fromCity: "Hubli",
        toCity: "Bangalore",
        busType: "AC",
        amenities: ["Wi-Fi", "TV"],
        rating: 4.3,
        duration: "6 hours",
      },
    ];

    await Bus.insertMany(buses);
    console.log("Database seeded successfully!");
  } catch (err) {
    console.error(err.message);
  } finally {
    mongoose.connection.close();
  }
};

const run = async () => {
  await connectDB();
  await seedDatabase();
};

run();
