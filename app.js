const express = require('express');
const movies = require("./movies.json");
const crypto = require("node:crypto");
const cors = require("cors");
const { validateMovie, validatePartialMovie } = require('./schemas/movies')




const app = express();

const PORT = process.env.PORT ?? 1234;


app.disable('x-powered-by');
app.use(express.json());

app.use(cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        'http://localhost:8080'
        
      ]
      
      if (ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true)
      }
      
      if (!origin) {
        return callback(null, false)
      }

      return callback(new Error('Not allowed by CORS'))
    }
  }))
  
  

app.get("/", (req, res) => {
    res.status(200).json({ message: "Hola mundo desde NodeJS y Express" });
});

app.get("/movies", (req, res) => {
    
    const { genre } = req.query;

    if (genre) {
        const filteredMovies = movies.filter(m => m.genre.some(g => g.toLowerCase() === genre.toLowerCase()));
        return res.status(200).json(filteredMovies);
    }

    res.status(200).json(movies);
});

app.get("/movies/:id", (req, res) => {
    const { id } = req.params;
    const movie = movies.find(m => m.id === id);
    if (movie) return res.status(200).json(movie);

    res.status(404).send("<h1>404</h1>");
});

app.post("/movies", (req, res) => {

    const result = validateMovie(req.body);

    if(result.error)
        return res.status(402).send( {error: JSON.parse(result.error.message)});

        
    const newMovie = {
        id: crypto.randomUUID(),
        ...result.data
    };
    movies.push(newMovie);

    res.status(201).json(newMovie);
})

app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body)
  
    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
  
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)
  
    if (movieIndex === -1) {
      return res.status(404).json({ message: 'Movie not found' })
    }
  
    const updateMovie = {
      ...movies[movieIndex],
      ...result.data
    }
  
    movies[movieIndex] = updateMovie
  
    return res.json(updateMovie)
  })
  
  app.delete('/movies/:id', (req, res) => {
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)
  
    if (movieIndex === -1) {
      return res.status(404).json({ message: 'Movie not found' })
    }
  
    movies.splice(movieIndex, 1)
  
    return res.json({ message: 'Movie deleted' })
  })

app.use((req, res) => {
    res.status(404).send("<h1>404</h1>");
})
app.listen(PORT, () => {
    console.log("escuchando en el puerto: " + PORT);
});
