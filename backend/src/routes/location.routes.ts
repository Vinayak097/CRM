import express from "express";
import { LocationModel } from "@/models/location.model.js";
const router = express.Router();

router.get("/search", async (req, res) => {
  const q = String(req.query.q || "").trim();
  const limit = Math.min(
    req.query.limit ? parseInt(String(req.query.limit)) : 10,
    100
  );

  const locations = await LocationModel.find({
    name: { $regex: q, $options: "i" },
    active: true,
  })
    .select("_id name")
    .limit(limit);

  res.json(locations);
});

export default router;
