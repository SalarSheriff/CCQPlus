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
            data.sort((a, b) => {
                const parameterA = a.sort_date_time.toLowerCase(); // Convert to lowercase for case-insensitive sorting
                const parameterB = b.sort_date_time.toLowerCase();

                if (parameterA < parameterB) {
                    return -1; // a should come before b
                }
                if (parameterA > parameterB) {
                    return 1; // b should come before a
                }
                return 0; // parameters are equal

            });
           

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
            
            res.render('home', {cadetname: latestLog.name, assumetime: latestLog.time, shiftduration: latestLog.shiftduration, logs: data});
        });
    

    




   
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
        
        res.render("qlog", {logs: data});
    });




})




app.get("/ptbreak/:name/:duration", (req, res)=> {

var options = {
    method: 'POST',
    url: 'https://ccqplus-09cf.restdb.io/rest/qlog',
    headers:
    {
        'cache-control': 'no-cache',
        'x-apikey': 'eade1f90254f4c9de8a0efde3c860c244ce6a',
        'content-type': 'application/json'
    },
    body: { name: req.params.name, time: getCurrentMilitaryTimeShifted(-parseInt(req.params.duration)),  message: req.params.name + " conducted PT", action: "pt break", time_end: getCurrentMilitaryTime(), sort_date_time: getCurrentESTDateTime()},
    json: true
};

request(options, function (error, response, body) {
    if (error) throw new Error(error);

    res.send("good!")
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
        body: { name: req.params.name, time: getCurrentMilitaryTime(),  message: req.params.name + " was relieved from the Q", action: "relieved",sort_date_time: getCurrentESTDateTime()},
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
        body: { name: req.params.name, time: req.params.time,  message: req.params.message, action: req.params.action,time_end: getCurrentMilitaryTime(),sort_date_time: getCurrentESTDateTime()},
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
        body: { name: cadetname, time: getCurrentMilitaryTime() , message: 'CDT ' + cadetname + " assumes the CCQ", action:'assumes', shiftduration: shiftDuration, sort_date_time: getCurrentESTDateTime()},
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
  function getCurrentMilitaryTimeShifted(shift) {
    const now = new Date();

    // Apply the shift to the current time
    now.setMinutes(now.getMinutes() + shift);

    // Convert the adjusted time to EST
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

  /*This function will store the exact year month day hour minute and second and will be added to all
   messages stored in the RESTDB so that they can be sorted by this parameter "sort_date_time"
   For some reason data uploaded to the database is not sorted by any order
  */
  function getCurrentESTDateTime() {
    // Get current date and time in UTC
    const nowUTC = new Date();

    // Adjust for EST (UTC - 5 hours)
    const estOffset = -5 * 60 * 60 * 1000;
    const estTime = new Date(nowUTC.getTime() + estOffset);

    // Extract individual components
    const year = estTime.getFullYear();
    const month = (estTime.getMonth() + 1).toString().padStart(2, '0');
    const day = estTime.getDate().toString().padStart(2, '0');
    const hour = estTime.getHours().toString().padStart(2, '0');
    const minute = estTime.getMinutes().toString().padStart(2, '0');
    const second = estTime.getSeconds().toString().padStart(2, '0');

    // Return formatted string
    return `${year}${month}${day}${hour}${minute}${second}`;
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




