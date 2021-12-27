const express = require('express')
const app = express();
const port = process.env.PORT || 8000;
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const Sensor = require('./models/sensorModel');
const nodemailer = require("nodemailer");

// Use the bodyParser to parse the request in middleware before handle the body
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(cors());

const dataSensorChanged = Sensor.watch();

mongoose.connect('mongodb+srv://SensorsDB:HMR0ZDrrXpgbp29Q@cluster0.v4ga8.mongodb.net/sensor?retryWrites=true&w=majority');
mongoose.connection
  .once("open", () => console.log("Connected"))
  .on("error", error => {
    console.log("Your Error", error);
  })



// Update exist sensor or add a new one.
async function updateSensor(sensorId, sensorTime, sensorValue) {

  try {

    if ((sensorId === " " || sensorTime === " ") || (sensorId === null || sensorTime === null) || (sensorId === "" || sensorTime === ""))
      return 400;

    if (sensorId === sensorTime)
      return 409;


    // Update sensor with specific sensorId
    Sensor.findOneAndUpdate(
      { sensorId: sensorId },
      { $set: { time: sensorTime, value: sensorValue } },
    ).then((result) => {

      // If result is NOT null means that you updated some exist Sensor
      if (result != null) {
        return 204;

        // If result IS null means that the sensorId not exist in any sensor on database so it will be added as new Sensor with the values that you have give.
      } else if (result === null) {

        // Object that will be added to model
        var newSensor = {
          sensorId: sensorId,
          time: sensorTime,
          value: sensorValue
        }

        // Create a new object from the model and save it to database
        var data = new Sensor(newSensor);
        data.save();

        return 200;
      }else{
        console.log("Nothing updated");
      }

    });


  } catch (e) {
    console.error(e);
    return 500;
  }
}


//Connect mongoDB and read some data
async function readSensorData(sensorId, since, until) {

  try {
    // From the object sensor try to find with specific id, some sensor which also the value time is between the range since - until
    const doc = await Sensor.find({ $and: [{ sensorId: sensorId }, { time: { $gte: since } }, { time: { $lte: until } }] });
    return doc;

  } catch (err) {

    console.log("You have the following error on /data -> " + err);

  }
}

// This fucntion called when the value changed on a sensor
async function sendEmail(){


  
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: false,
    secure: false, // true for 465, false for other ports
    service: 'Gmail',
    auth: {
      user: "", 
      pass: "", 
    },
  });
  
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Sensor Team 👻" <sensor_team@example>', // sender address
    to: "info@pp6.gr", // list of receivers
    subject: "Sensor Data update! | Sensor Team ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello! Some sensor's data has changed! Please check it</b>", // html body
  });
  
  console.log("Message sent: %s", info.messageId);
  
  
  }

// PART TRHEE
// When something change
dataSensorChanged.on('change', change =>  {

  //Get the keys from the changed values
  var keys = Object.keys(change['updateDescription']['updatedFields']);
  
  // Check each key if match with value and if this is true then send email about the value
  keys.forEach(function(key) { //loop through keys array

    if( ((key === "value") && (change['updateDescription']['updatedFields']['value'] >= 30)) || (key === "value") && (change['updateDescription']['updatedFields']['value'] <= 20) ){
      sendEmail();
    }
  });
  
  
});


// PART TWO
// Read the data with specific parameters
app.get('/data', async (req, res) => {

  // Get the data from the GET - Request and save it into some const
  const sensorId = req.query.sensorId;
  const since = req.query.since;
  const until = req.query.until;


  //Call the function for the update and get back the result.
  readSensorData(sensorId, since, until)
    .then((result) => res.send(result))
    .catch(console.error);


});


// PART ONE
// Put data into the database from a sensor
app.put('/putSensorData', (req, res) => {

  const sensorID = req["body"]["sensorId"];
  const sensorTime = req["body"]["time"];
  const sensorValue = req["body"]["value"];

  //Call the function for the update and get back the result.
  updateSensor(sensorID, sensorTime, sensorValue)
    .then((result) => res.send(result))
    .catch(console.error);

});




app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});