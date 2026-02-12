require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();


// ======================
// MIDDLEWARE
// ======================
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));


// ======================
// ROUTES IMPORT
// ======================

// IT
const itAuthRoutes = require("./routes/it_auth");
const itDataRoutes = require("./routes/it_data");

// MATHS
const mathsAuthRoutes = require("./routes/mth_auth");
const mathsDataRoutes = require("./routes/mth_data");


// ======================
// ROUTES USE
// ======================

// IT routes
app.use("/it/auth", itAuthRoutes);
app.use("/it/api", itDataRoutes);

// Maths routes
app.use("/maths/auth", mathsAuthRoutes);
app.use("/maths/api", mathsDataRoutes);


// ======================
// HOME ROUTE
// ======================
app.get("/", (req, res) => {
  res.send("🚀 Master LMS API is running successfully");
});


// ======================
// SERVER START
// ======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
