const express = require('express')
const fs = require('fs');


const app = express()
const PORT = process.env.PORT || 3000
const { v4: uuidv4 } = require('uuid');


app.get("/", (req, res) =>{
res.send("Hello World")



})


app.get("/createfile",(req,res)=> {
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


app.listen(PORT, ()=> {
    console.log("server is running on PORT: " + PORT)
})




