
# BlackBus Backend

This is the backend of **BlackBus**, a bus ticket booking system built with Express.js.

## Requirements

- Node.js
- Express.js
- MongoDB
- JWT for authentication

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/blackbus-backend.git
   cd blackbus-backend
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file and add the following environment variables:
   ```
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Available Routes

### Public Routes

- **Search Buses:**
  - `GET /api/buses/search`: Search buses based on criteria (e.g., from city, to city, date).
  
- **Get All Buses:**
  - `GET /api/buses`: Fetch all available buses.

- **Bus Details:**
  - `GET /api/buses/:busId`: Get specific bus details.

- **Available Seats:**
  - `GET /api/buses/:busId/available-seats`: Get the available seats for a specific bus.

### Authenticated User Routes

- **Book a Seat:**
  - `POST /api/buses/book`: Book a seat on a specific bus (requires authentication).
  
- **Cancel Booking:**
  - `POST /api/buses/cancel`: Cancel a seat booking (requires authentication).
  
- **View User Bookings:**
  - `GET /api/buses/user/bookings`: View all bookings made by the logged-in user.

### Admin Routes

- **Create Bus:**
  - `POST /api/buses/create`: Create a new bus (requires admin authentication).
  
- **Get Bus Tickets:**
  - `GET /api/buses/:busId/tickets`: Get all booked tickets for a specific bus (requires admin authentication).
  
- **Reset Bus:**
  - `POST /api/buses/reset`: Reset the bus data (requires admin authentication).

### Auth Routes

- **Register:**
  - `POST /api/auth/register`: Register a new user.
  
- **Login:**
  - `POST /api/auth/login`: Log in a user and receive a token.
  
- **Get User Details:**
  - `GET /api/auth/user`: Get the logged-in user's details (requires authentication).

## Middleware

- **auth.js**: Protects routes to ensure only authenticated users can access them.
- **adminAuth.js**: Additional protection for admin routes.

## Running the Project

1. Start the MongoDB server or use a cloud MongoDB service.
2. Run the backend using:
   ```bash
   npm start
   ```

3. Access the API at `http://localhost:5000`.

## License

This project is licensed under the MIT License.
