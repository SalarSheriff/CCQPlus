const express = require('express')
const path = require('path')
const fs = require('fs');
var request = require("request");



const app = express()

//Be able to parse post data
app.use(express.urlencoded({ extended: true }));


//used to serve static files
app.use(express.static(path.join(__dirname, 'public')))
const PORT = process.env.PORT || 3000
const { v4: uuidv4 } = require('uuid');



app.get("/", function (req, res) {
    res.sendFile(__dirname + "/signin.html");
})


app.get("/getqlog", function (req, res) {

    var request = require("request");

    var options = {
        method: 'GET',
        url: 'https://ccqplus-09cf.restdb.io/rest/qlog',
        headers:
        {
            'cache-control': 'no-cache',
            'x-apikey': 'eade1f90254f4c9de8a0efde3c860c244ce6a'
        }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);


        let data = JSON.parse(body);
        res.send(data);
    });




})

app.post("/signin", function (req, res) {

    let cadetname = req.body.cadetname.toString();

    



    //Add assuming duty to the log
    var options = {
        method: 'POST',
        url: 'https://ccqplus-09cf.restdb.io/rest/qlog',
        headers:
        {
            'cache-control': 'no-cache',
            'x-apikey': 'eade1f90254f4c9de8a0efde3c860c244ce6a',
            'content-type': 'application/json'
        },
        body: { name: cadetname, time: getCurrentMilitaryTime() , message: 'CDT ' + cadetname + " assumes the CCQ", action:'assumes'},
        json: true
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        console.log(body);
    });

})

function getCurrentMilitaryTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
  }











//use REST DB and Render

app.get("/createfile", (req, res) => {
    // Generate a random filename
    const randomFileName = `${uuidv4()}.txt`;

    // Path to save the file (assuming it's in the current directory)
    const filePath = `./${randomFileName}`;

    // Create a blank text file
    fs.writeFile(filePath, '', (err) => {
        if (err) {
            console.error('Error creating file:', err);
            return;
        }
        console.log(`Blank text file created with name: ${randomFileName}`);
    });
})


app.listen(PORT, () => {
    console.log("server is running on PORT: " + PORT)
})




