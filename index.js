import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import axios from "axios";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let tableData = [];

const fetchData = async () => {
  try {
    const res = await axios.get("https://jsonplaceholder.typicode.com/users");
    tableData = res.data;
    console.log("Data fetched");
  } catch (err) {
    console.error(err);
  }
};

app.get("/", (req, res) => {
  res.send("Server is running");
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("requestInitialData", () => {
    socket.emit("initialData", tableData);
  });

  socket.on("addRow", (newRow) => {
    tableData.push(newRow);
    io.emit("rowAdded", newRow);
  });

  socket.on("updateRow", (updatedRow) => {
    tableData = tableData.map((row) =>
      row.id === updatedRow.id ? updatedRow : row
    );
    io.emit("rowUpdated", updatedRow);
  });

  socket.on("deleteRow", (id) => {
    tableData = tableData.filter((row) => row.id !== id);
    io.emit("rowDeleted", id);
  });
});

await fetchData();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
