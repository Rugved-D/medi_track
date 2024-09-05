const express = require("express");
const path = require("path");
const fs = require("fs");
const csvParser = require("csv-parser");

const app = express();
const csvFilePath = path.join(__dirname, "files", "medications.csv");

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure 'files' directory exists
const filesDir = path.join(__dirname, "files");
if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir);
}

// Route to display the medications sorted by date and time
app.get("/", (req, res) => {
  const medications = [];

  if (fs.existsSync(csvFilePath)) {
    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on("data", (row) => {
        medications.push(row);
      })
      .on("end", () => {
        // Sort medications by date and time
        medications.sort((a, b) => {
          const dateA = new Date(`${a.Date}T${a.Time}`);
          const dateB = new Date(`${b.Date}T${b.Time}`);
          return dateA - dateB;
        });
        res.render("index", { medications });
      });
  } else {
    res.render("index", { medications });
  }
});

// Route to create a new medication entry
app.post("/create", (req, res) => {
  const { title, detail, date, time, phone } = req.body;

  if (!title || !detail || !date || !time || !phone) {
    return res.status(400).send("All fields are required.");
  }

  const csvLine = `${title},${detail},${date},${time},${phone}\n`;

  fs.appendFile(csvFilePath, csvLine, (err) => {
    if (err) {
      return res.status(500).send("Unable to write to file.");
    }
    res.redirect("/");
  });
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
