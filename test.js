import mongoose from "mongoose";
import Bus from "./models/Bus.js"; // Adjust the path as necessary
import axios from "axios";

const testQuery = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/BlackBus");
    console.log({
      fromCity: "City A",
      toCity: "City B",
      schedule: { $gte: JSON.stringify(new Date("2024-10-01T00:00:00Z")) },
    });
    const buses = await Bus.find({
      fromCity: "City A",
      toCity: "City B",
      schedule: { $gte: JSON.stringify(new Date("2024-10-01T00:00:00Z")) },
    });

    console.log("Found buses:", buses);
  } catch (err) {
    console.error(err.message);
  } finally {
    mongoose.connection.close();
  }
};

// testQuery();

const register = async (email, password) => {
  try {
    const response = await axios.post(
      "http://localhost:5000/api/auth/login",
      {
        email: "user@example.com",
        password: "user123",
      }
    );
    const token = response.data.token;
    // localStorage.setItem("token", token);

    // Fetch user data after successful registration
    const userResponse = await axios.get(
      "http://localhost:5000/api/auth/user",
      {
        headers: { "x-auth-token": token },
      }
    );

    console.log(userResponse.data.user); // Set user data
  } catch (error) {
    console.error("Registration failed:", error);
    throw new Error(error);
  }
};

register();
