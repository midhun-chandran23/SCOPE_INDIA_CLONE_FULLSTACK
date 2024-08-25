const mongoose = require('mongoose');
const express = require('express');
const CountryModel = require('./models/country');
const StateModel = require('./models/state');
const CityModel = require('./models/city');
const HobbyModel = require('./models/hobbies');
const mongoURI = "mongodb+srv://midhun233332:register123@cluster23.nwtirfp.mongodb.net/?retryWrites=true&w=majority&appName=cluster23";
const app = express();
const PORT = 5000;
const cors = require('cors');
const UserRouter = require('./routes/User'); // Assuming this route exists
const cookieParser = require('cookie-parser');
const session = require('express-session');

app.use(express.json());
const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(session({
    secret: 'your_secret_key',
    saveUninitialized: true,
    resave: true,
}));

app.use(cookieParser());
app.use("/student", UserRouter); // Ensure this route is correctly implemented

// Seed Countries
// Seed Countries
async function seedCountries() {
    const countries = [
        { name: 'United States', isoCode: 'US' },
        { name: 'Canada', isoCode: 'CA' },
        { name: 'Mexico', isoCode: 'MX' },
        { name: 'India', isoCode: 'IND' }
    ];
    
    for (let country of countries) {
        let existingCountry = await CountryModel.findOne({ isoCode: country.isoCode }).exec();
        if (!existingCountry) {
            // No existing document found, safe to insert
            await CountryModel.create(country);
        } else {
            console.log(`Country with isoCode "${country.isoCode}" already exists.`);
            // Handle the duplicate as needed (e.g., skip, update, etc.)
        }
    }
}
// Seed States
async function seedStates() {
    // Seed countries if they don't already exist
    await seedCountries(); // Ensure this function is correctly implemented

    // Get ObjectIds for USA and Canada
    const usaCountry = await CountryModel.findOne({ name: 'United States' }).lean();
    const canadaCountry = await CountryModel.findOne({ name: 'Canada' }).lean();
    const indiaCountry = await CountryModel.findOne({ name: 'India' }).lean();

    if (!usaCountry || !canadaCountry  || !indiaCountry) {
        console.error('One or all countries not found.');
        return;
    }

    // Prepare state data with country ObjectIds
    const statesUSA = [
        { name: 'California', country: usaCountry._id },
        { name: 'New York', country: usaCountry._id },
    ];

    const statesCanada = [
        { name: 'Ontario', country: canadaCountry._id },
        { name: 'Quebec', country: canadaCountry._id },
    ];

    const statesIndia = [
        { name: 'kerala', country: indiaCountry._id },
        { name: 'tamilnadu', country: indiaCountry._id },
    ];

    // Seed states
    await StateModel.insertMany(statesUSA);
    await StateModel.insertMany(statesCanada);
    await StateModel.insertMany(statesIndia);
}

// Seed Cities
async function seedCities() {
    // Seed states if they don't already exist
    await seedStates(); // Ensure this function correctly seeds states with their ObjectIds

    // Find ObjectIds for California and New York
    const californiaState = await StateModel.findOne({ name: 'California' }).lean();
    const newYorkState = await StateModel.findOne({ name: 'New York' }).lean();
    const keralaState = await StateModel.findOne({ name: 'kerala' }).lean();

    if (!californiaState || !newYorkState) {
        console.error('One or both states not found.');
        return;
    }


    // Prepare city data with state ObjectIds
    const citiesCA = [
        { name: 'Los Angeles', state: californiaState._id },
        { name: 'San Francisco', state: californiaState._id },
    ];

    const citiesNY = [
        { name: 'New York City', state: newYorkState._id },
        { name: 'Buffalo', state: newYorkState._id },
    ];

    const citiesIND =[
        { name: 'Kochi', state: keralaState._id },
        { name: 'Thiruvananthapuram', state: keralaState._id},

    ]

    // Seed cities
    await CityModel.insertMany(citiesCA);
    await CityModel.insertMany(citiesNY);
    await CityModel.insertMany(citiesIND);
}

mongoose.connect(mongoURI, {
    //    useNewUrlParser: true,
    //    useUnifiedTopology: true,
})
.then(async () => {
    console.log('Connected to MongoDB');

    // Seed dummy data
    await seedCountries();
    await seedStates();
    await seedCities();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
})
.catch(error => {
    console.error('MongoDB connection error:', error);
});

// Routes
app.get('/countries', async (req, res) => {
    try {
        const countries = await CountryModel.find();
        res.json(countries);
    } catch (err) {
        res.status(500).json({ message: "countries not fetched" });
    }
});

app.get('/states/:countryname', async (req, res) => {
    const countryname = req.params.countryname;
    try {
        const countrydetails = await CountryModel.findOne({ name: countryname });
        if (!countrydetails) {
            return res.status(404).json({ message: 'Country not found' });
        }
        const states = await StateModel.find({ country: countrydetails._id });
        res.json(states);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/cities/:statename', async (req, res) => {
    const statename = req.params.statename;
    try {
        const statedetails = await StateModel.findOne({ name: statename });
        const cities = await CityModel.find({ state: statedetails._id });
        res.json(cities);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/hobbies', async (req, res) => {
    try {
        const hobbies = await HobbyModel.find();
        res.json(hobbies);
    } catch (err) {
        res.status(500).json({ message: "hobbies not fetched" });
    }
});
