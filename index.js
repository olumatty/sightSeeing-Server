const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const { default: axios } = require('axios')

dotenv.config()

const app = express();
const PORT = 8003;

app.use(express.json())
app.use(cors())

app.get('/sight_seeeing', async(req, res) => {
    try{
        const destination = req.body

    }catch(error){

    }
});



app.listen(PORT, () =>{
    console.log(`The server is running on port ${PORT}`);
})