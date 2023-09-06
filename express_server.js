const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// a function that returns a string of 6 random alphanumeric characters: 
function generateRandomString() {
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    /* math.random * characters.length gives a random number, with math.floor making sure it's not a number with a decimal */
    const randomIndex = Math.floor(Math.random() * characters.length);
    /* populate empty '' with the .charAt the random number just produced in the characters string */
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
}

app.set("view engine", "ejs"); // tells express app to use EJS as template 

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true })); /* needs to be before all routes; will convert buffer body into string */ 

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  // Generate a random id for the new URL
  const id = generateRandomString();
  // Get the longURL from the request body 
  const longURL = req.body.longURL;
  // Add the id-longURL pair to the urlDatabase
  urlDatabase[id] = longURL;
  // Redirect to the page that displays the newly created URL
  res.redirect(`/urls/${id}`);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id; //will show just shortened id
  const longURL = urlDatabase[id]; //will show entire url including id
  const templateVars = { id: id, longURL: longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id; // Get the id parameter from the URL
  const longURL = urlDatabase[id]; // Retrieve the longURL from the urlDatabase
  if (longURL) {
    res.redirect(longURL); // Redirect to the longURL if it exists
  } else {
    res.status(404).send("URL not found"); // Handle the case where the id is not found in the database
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id; // Get the id parameter from the URL
  delete urlDatabase[id]
  res.redirect("/urls")
});

app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id; // Get the id parameter from the URL
  const newLongURL = req.body.newLongURL; // Get the updated URL from the form input
  // Update the URL in urlDatabase using the id
  urlDatabase[id] = newLongURL;
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  const { username } = req.body; // Get the username from the request body
  res.cookie("username", username); // Set the username as a cookie
  res.redirect("/urls"); // Redirect to the /urls page
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
