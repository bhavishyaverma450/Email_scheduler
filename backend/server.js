import express from "express";
import cors from "cors";
import emailRoutes from "./routes/emailRoutes.js";

const app=express();
const PORT=5000;

app.use(cors({origin:"http:localhost:5173"}));
app.use(express.json());
app.get('/api/emails',emailRoutes);

app.listen(PORT,()=>{
    console.log(`Backend running at http://localhost:${PORT}`);
})