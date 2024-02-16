import express from "express";
import { PORT } from "../constants.js";
import { fileURLToPath } from "url";
import path from "path";
import authenticate from "./services/get-schedule.service.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.post("/schedule", authenticate);

app.listen(PORT, () => console.log(`Server hering in port ${PORT}}`));
