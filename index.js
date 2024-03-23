/*


git add .
git commit -m ""
git push -u origin main

Server hosted on Render
Database on RESTDB

*/





const express = require('express')
const path = require('path')
const fs = require('fs');
var request = require("request");



const app = express()

//Be able to parse post data
app.use(express.urlencoded({ extended: true }));


//used to serve static files
app.use(express.static(path.join(__dirname, 'public')))

app.set('view engine', 'ejs');


const PORT = process.env.PORT || 3000
const { v4: uuidv4 } = require('uuid');
const e = require('express');





//Variables used by app
//IF these are lost by the due to server resets, create a method to restore these variables by pulling from the data base
let currentCadet = ""
let currentAssumeTime = ""
let currentShiftDuration = ""







app.get('/home', (req, res) => {


    //If the server resets due to inactivity, fetch and update the latest data from the server
    if (currentCadet == "") {
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
            


            //get the last log of type "assume", if we just pick the last log, then it could be a presence patrol.
            //this way we get the latest person on the doc
            let assumeLogs = []

            data.forEach(log => {
                if (log.action == "assumes") {
                    assumeLogs.push(log)
                }
            });
            let latestLog = assumeLogs[assumeLogs.length - 1]; //2nd last is the last log




            currentCadet = latestLog.name;
            currentAssumeTime = latestLog.time;
            currentShiftDuration = latestLog.shiftduration;
            
            res.render('home', {cadetname: currentCadet, assumetime: currentAssumeTime, shiftduration: currentShiftDuration});
        });
    }

    //If server did not sleep
    else {
        res.render('home', {cadetname: currentCadet, assumetime: currentAssumeTime, shiftduration: currentShiftDuration});
    }




   
});

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



app.get('/endshift/:name',(req, res)=> {
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
        body: { name: req.params.name, time: getCurrentMilitaryTime(),  message: req.params.name + " was relieved from the Q", action: "relieved"},
        json: true
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        res.send("good!")
    });

})

app.get('/uploadpresencepatrol/:name/:time/:message/:action', (req, res) => {
    console.log(req.params)

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
        body: { name: req.params.name, time: req.params.time,  message: req.params.message, action: req.params.action,time_end: getCurrentMilitaryTime()},
        json: true
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        res.send("good!")
    });


})


app.post("/signin", function (req, res) {

    let cadetname = req.body.cadetname.toString();
    let shiftDuration = parseInt(req.body.shiftduration.toString());
    //Store who is curretnly monitoring the Q
    currentCadet = cadetname;
    currentShiftDuration = shiftDuration;
    currentAssumeTime = getCurrentMilitaryTime();


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
        body: { name: cadetname, time: getCurrentMilitaryTime() , message: 'CDT ' + cadetname + " assumes the CCQ", action:'assumes', shiftduration: shiftDuration},
        json: true
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        res.redirect("/home")
    });

})

function getCurrentMilitaryTime() {
    const now = new Date();
    
    // Convert the current time to EST
    const estOptions = {timeZone: 'America/New_York'};
    const estTime = now.toLocaleString('en-US', estOptions);
    const estDate = new Date(estTime);
    
    // Get the hours, minutes, and seconds in EST
    const hours = estDate.getHours().toString().padStart(2, '0');
    const minutes = estDate.getMinutes().toString().padStart(2, '0');
    const seconds = estDate.getSeconds().toString().padStart(2, '0');
    
    // Return the time in the same format
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




