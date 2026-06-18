import express from "express";
const app = express();
import path from "path";
import { MongoClient } from "mongodb";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
})

const MongoURL = "mongodb://127.0.0.1:27017";
const client = new MongoClient(MongoURL);




// Get all users

app.get("/getAllUsers", async (req, res) => {
    try {
        await client.connect(MongoURL);
        const db = client.db("mydb");
        const users = await db.collection("users").find().toArray();
        client.close();
        res.send(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

//Post user data
app.post("/adduser", async (req, res) => {
    try {
        const UserObject = req.body;
        await client.connect(MongoURL);
        const db = client.db("mydb");
        await db.collection("users").insertOne(UserObject);
        client.close();
        res.status(201).json({ message: "User added successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to add user" });
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


