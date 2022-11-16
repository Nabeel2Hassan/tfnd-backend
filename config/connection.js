const mongoose = require("mongoose");
const mongoAtlasUri = `mongodb+srv://zain:${process.env.MongoPass}@cluster0.l3hffv3.mongodb.net/?retryWrites=true&w=majority`;

try {
  // Connect to the MongoDB cluster
  mongoose.connect(
    mongoAtlasUri,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log(" Mongoose is connected")
  );
} catch (e) {
  console.log("could not connect");
}

const dbConnection = mongoose.connection;
dbConnection.on("error", (err) => console.log(`Connection error ${err}`));
dbConnection.once("open", () => console.log("Connected to DB!"));
