import paraphraseRoute from "./routes/paraphraseRoute.js";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/paraphrase", paraphraseRoute);

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
