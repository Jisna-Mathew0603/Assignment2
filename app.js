const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

let moviesData = [];

// Middleware to parse URL-encoded data and serve static files
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Load Handlebars engine and set views
const exphbs = require('express-handlebars').engine;
app.engine('hbs', exphbs({
    extname: '.hbs',
    helpers: {
        highlightIfBlank: function(metascore) {
            return (metascore === "" || metascore === "N/A") ? 'highlight' : '';
        },
        isMetascoreValid: function(metascore) {
            return metascore !== "" && metascore !== "N/A";
        }
    },
    partialsDir: path.join(__dirname, 'views/partials') // Ensure this line is included
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Load JSON data once on server start
const jsonFilePath = path.join(__dirname, 'movieData.json');
fs.readFile(jsonFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading JSON file:', err);
        process.exit(1);
    } else {
        moviesData = JSON.parse(data);
        console.log('Loaded Movies Data:', moviesData);
    }
});

// Route for home page
app.get('/', (req, res) => {
    res.render('index', { title: 'Express', name: 'Jisna Mathew', studentId: 'n01618824' });
});

// Route for loading JSON data
app.get('/data', (req, res) => {
    const jsonFilePath = path.join(__dirname, 'movieData.json');
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            res.render('error', { title: 'Error', message: 'Error loading JSON file.' });
        } else {
            moviesData = JSON.parse(data);
            res.render('data', { title: 'Data Loaded', message: 'JSON data is loaded and ready!' });
        }
    });
}); 

// Route to display movie details by index
app.get('/data/movie/:index', (req, res) => {
    const index = parseInt(req.params.index, 10);
    if (isNaN(index) || index < 0 || index >= moviesData.length) {
        return res.render('error', { title: 'Error', message: 'Invalid index. Please enter a valid index number.' });
    }
    const movie = moviesData[index];
    res.render('movie', { title: 'Movie Details', movie });
});

// Route for search form by movie ID
app.get('/data/search/id', (req, res) => {
    res.render('searchByID', { title: 'Search by Movie ID' });
});

// Route to handle search by movie ID and display results
app.post('/data/search/id', (req, res) => {
    const movieID = parseInt(req.body.movieID, 10);
    const movieInfo = moviesData.find(movie => movie.Movie_ID === movieID);
    if (movieInfo) {
        res.render('movie', { title: 'Movie Information', movie: movieInfo });
    } else {
        res.render('error', { title: 'Not Found', message: 'Movie ID not found. Please enter a valid Movie ID.' });
    }
});

// Search form by title (Handlebars)
app.get('/data/search/title/', (req, res) => {
    res.render('searchByTitle', { title: 'Search Movie by Title' });
});

// Search for movies by title (Handlebars)
app.post('/data/search/title', (req, res) => {
    const searchTitle = req.body.movieTitle.toLowerCase();
    const foundMovies = moviesData.filter(movie =>
        movie.Title.toLowerCase().includes(searchTitle)
    );

    res.render('searchResultsTitle', { title: `Search Results for "${req.body.movieTitle}"`, movies: foundMovies });
});

// Route to display all movie data in a table
app.get('/allData', (req, res) => {
    res.render('allData', { title: 'All Movies', movies: moviesData });
});

// Catch-all route for undefined routes
app.use((req, res) => {
    res.status(404).render('error', { title: '404', message: 'Page Not Found' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
