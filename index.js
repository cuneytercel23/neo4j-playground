const express = require("express");
const dotenv = require("dotenv");
const { createUser, deleteUser, updateUser, createMusic, deleteMusic, updateMusic, createAlbum, getUserById, getUserWithRelationshipsById, getMusicById, getAllMusics, getAlbumById, getAllAlbums } = require('./neo4jclient');

dotenv.config();
const app = express();
app.use(express.json());

// Create User
app.post("/user", async (req, res) => {
  try {
    const result = await createUser(req.body);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Delete User
app.delete("/user/:id", async (req, res) => {
  try {
    const result = await deleteUser(req.params.id);
    res.status(204).send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update User
app.patch("/user", async (req, res) => {
  try {
    const result = await updateUser(req.body);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get User by ID
app.get("/user/:id", async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    res.status(200).send(user);
  } catch (error) {
    res.status(404).send(error);
  }
});

// Get User Details by ID
app.get("/user/details/:id", async (req, res) => {
  try {
    const userDetails = await getUserWithRelationshipsById(req.params.id);
    res.status(200).send(userDetails);
  } catch (error) {
    res.status(404).send(error);
  }
});

// Create Music
app.post("/music", async (req, res) => {
  try {
    const result = await createMusic(req.body);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Delete Music
app.delete("/music/:id", async (req, res) => {
  try {
    const result = await deleteMusic(req.params.id);
    res.status(204).send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update Music
app.put("/music", async (req, res) => {
  try {
    const result = await updateMusic(req.body);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get Music by ID
app.get("/music/:id", async (req, res) => {
  try {
    const music = await getMusicById(req.params.id);
    res.status(200).send(music);
  } catch (error) {
    res.status(404).send(error);
  }
});

// Get All Musics
app.get("/musics", async (req, res) => {
  try {
    const musics = await getAllMusics();
    res.status(200).send(musics);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Create Album
app.post("/album", async (req, res) => {
  try {
    const result = await createAlbum(req.body);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get Album by ID
app.get("/album/:id", async (req, res) => {
  try {
    const album = await getAlbumById(req.params.id);
    res.status(200).send(album);
  } catch (error) {
    res.status(404).send(error);
  }
});

// Get All Albums
app.get("/albums", async (req, res) => {
  try {
    const albums = await getAllAlbums();
    res.status(200).send(albums);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen("3000", () => {
  console.log("listening");
});
