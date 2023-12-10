const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.log("Error occurred while Database connection", err);
  });

const blogSchema = new mongoose.Schema({
  title: String,
  description: String,
  imageURL: String
});
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

const Blog = new mongoose.model("Blog", blogSchema);

app.get('/', (req, res) => {
  Blog.find({})
    .then((posts) => {
      res.render("index", { blogPosts: posts });
    })
    .catch((err) => {
      console.log("Error getting data", err);
      res.redirect("/");
    });
});

app.get('/compose', (req, res) => {
  res.render('compose');
});

app.post('/compose', (req, res) => {
  const title = req.body.title;
  const image = req.body.imageUrl;
  const description = req.body.description;

  const newBlog = new Blog({
    imageURL: image,
    title: title,
    description: description,
  });

  newBlog.save()
    .then(() => {
      console.log("New Blog Posted");
    })
    .catch((err) => {
      console.log("Error posting New Blog", err);
    });

  res.redirect('/');
});

app.get('/post/:id', (req, res) => {
  const reqID = req.params.id;

  Blog.findOne({ _id: reqID })
    .then((post) => {
      if (!post) {
        console.log("Post Not Found");
        res.redirect("/");
      } else {
        res.render("post", { blogPost: post });
      }
    })
    .catch((err) => {
      console.log("Error finding post", err);
      res.redirect("/");
    });
});

app.get('/post/delete/:id', async (req, res) => {
  try {
    const idToDelete = req.params.id;
    const deletedPost = await Blog.deleteOne({ _id: idToDelete });

    if (deletedPost.deletedCount === 0) {
      console.log('Blog post not found');
      return res.status(404).send('Blog post not found');
    }

    console.log('Blog post deleted successfully');
    
    // Redirect back to the index page after successful deletion
    res.redirect('/');
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).send('Internal Server Error');
  }
});





// Placeholder for signup and login routes
app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", (req, res) => {
  const { email, password } = req.body;

  // Check if the email is already registered
  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        console.log("Email is already registered");
        return res.redirect("/signup");
      }

      // Create a new user
      const newUser = new User({
        email,
        password,
      });

      // Save the new user to the database
      newUser
        .save()
        .then(() => {
          console.log("New User Created");
          res.redirect("/login");
        })
        .catch((err) => {
          console.log("Error Creating New User", err);
          res.redirect("/signup");
        });
    })
    .catch((err) => {
      console.log("Error checking existing user", err);
      res.redirect("/signup");
    });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Find the user with the provided email
  User.findOne({ email })
    .then((user) => {
      if (user && user.password === password) {
        // Successful login
        res.redirect("/");
      } else {
        // Invalid credentials
        res.redirect("/login");
      }
    })
    .catch((err) => {
      console.log("Error finding user", err);
      res.redirect("/login");
    });
});


app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server Listening on port " + port);
});
