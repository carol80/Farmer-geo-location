var express = require('express')
var logger = require('morgan')
var bodyParser = require('body-parser')
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const session = require('express-session');
var XLSX = require("xlsx");
const fetch = require('node-fetch');
const http = require('http');

var admin = require('firebase-admin')

// This account is no longer valid
var serviceAccount = require('./agriculture-db-firebase-adminsdk-h8r3y-279d91e862.json')

var firebaseAdmin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://agriculture-db.firebaseio.com"
})

var database = firebaseAdmin.database()

// Create instance of express app
var app = express()

// We want to serve js and html in ejs
// ejs stands for embedded javascript
app.set('view engine', 'ejs')

// We also want to send css, images, and other static files
app.use(express.static('views'))
app.set('views', __dirname + '/views')

// Give the server access to the user input
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(logger('dev'))

app.get('/', function(request, response){

    // var restaurantsRef = database.ref("/restaurants")
    
    // restaurantsRef.once('value', function(snapshot){
    //     var data = snapshot.val()
        
    //     if ( !data ) {
    //         data = {}
    //     }
        
        response.render('home.ejs')        
    // })
})




app.post('/generate_form', (req, res) => {
    var result = {
        "village" : req.body.village,
        "survey_no" : req.body.survey_no,
        "sub_division_of" : req.body.sub_division_of,
        "taluka" : req.body.taluka,
        "address" : req.body.address,
        "name_of_occupant" : req.body.name_of_occupant,
        "khata_no" : req.body.khata_no,
        "name_of_the_rent" : req.body.name_of_the_rent,
        "phone" : req.body.phone,
        "pending" : "0"
    } 

    database.ref("pending/"+ "whatsapp:" + req.body.phone).set(result);

    // database.ref("seven_one_/" + req.body.From).set(req.body);

    res.render("7-12-doc", { result });

// Write function to get lat and lang Passs address 
    // var data ={
    //   address : req.body.address
    // }
    // console.log(data)
    // res.render('index',data = data.address)
})

app.get("/getmap", function(req, res) {
  res.render("index");
});

app.post("/getmap", function(req, res) {
  arr = req.body.carol;

  console.log(arr);
  res.json({ status: "Done" });
});

app.post("/saveCoordinate", function(req, res) {
  var whatsapp = "+919594246827";
  var setDoc = database
    .ref("pending/" + whatsapp)
    .update({ coordinates: req.body.coordinate, area: req.body.area });
  console.log(req.body);
});


app.get("/getExcelData", (req, res) => {
  var workbook = XLSX.readFile(__dirname + "/views/excel/crop_data.xlsx");
  var sheet_name_list = workbook.SheetNames;
  var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
  // console.log(xlData[0]);
  var rainfall_list = [];
  var crop_list = [];
  var humid_list = [];
  var irri_list = [];
  var min_temp_list = [];
  var max_temp_list = [];
  xlData.forEach(row => {
    rainfall_list.push(row.Rainfall);
    crop_list.push(row.Crops);
    humid_list.push(row.Humidity);
    irri_list.push(row.Irrigation);
    min_temp_list.push(row.Min);
    max_temp_list.push(row.Max);
  });
  my_json = {
    rainfall: rainfall_list,
    crops: crop_list,
    humidity: humid_list,
    irri: irri_list,
    min: min_temp_list,
    max: max_temp_list
  };
  res.json(my_json);
});

// app.post("/farm_result", function(req, res) {
//   let whatsapp = req.body.submit;
//   console.log(whatsapp);
//   database.ref("pending/" + whatsapp).once("value", function(result) {
//     var farm_details = result.val();
//     console.log(farm_details);
//     res.render("farm_result", mydata = farm_details);
//   });
// });

app.use(session({secret: 'anything-you-want-but-keep-secret'}));


//global variable//

var opt = 999                                     
var reg = 999
var registration = 999


app.post('/sms', async (req, res) => {
    const twiml = new MessagingResponse();
    // const smsCount = req.session.counter || 0;
    // let message = 'Hello, thanks for the new message.';
    // if(smsCount > 0) {
    //   message = 'Hello, thanks for message number ' + (smsCount + 1);
    // }
    // req.session.counter = smsCount + 1;
    // const twiml = new MessagingResponse();
    // twiml.message(message);
  
    
    // const message = twiml.message();
    // message.body('The Robots are coming! Head for the hills!');
    // message.media('https://farm8.staticflickr.com/7090/6941316406_80b4d6d50e_z_d.jpg');
  
  
    var counter = req.session.counter || 0
    var message = 'Hello, thanks for the new message.';
    const text = req.body.Body
    const xxx = req.body.From
      
    //  var x = database.ref('users').on('phone'), async (data) => {
    //      return data.val(); 
    //   });
    //  console.log(typeof x);

    database.ref("users").orderByChild("phone").equalTo(xxx).once("value",snapshot => {
        if (snapshot.exists()){
          const userData = snapshot.val();
          console.log("exists!", userData);
        }
    });
  
    //  var registration = 1;
    //  if(x.includes(xxx)){
    //   registration = 0;
    //   }  
      
      console.log(registration)
  
    function add_form(text) {
      let obj = (text.split('\n'))
      // console.log(typeof obj)
      let obj1 = []
      for(var i=0;i<8;i++){
        obj1.push(obj[i].split(':')[1])
      }
  
      const pending = {
        "village" : obj1[0],
        "survey_no" : obj1[1],
        "sub_division_of" : obj1[2],
        "taluka" : obj1[3],
        "cut_land" : obj1[4],
        "name_of_occupant" : obj1[5],
        "khata_no" : obj1[6],
        "name_of_the_rent" : obj1[7],
        "phone" : req.body.From,
        "pending" : "0",
      };
      return pending;
    }
  
  
    function add_user(text) {
      let obj = (text.split('\n'))
      // console.log(typeof obj)
      let obj1 = []
      for(var i=0;i<4;i++){
        obj1.push(obj[i].split(':')[1])
      }
  
      const user = {
        name : obj1[0],
        email : obj1[1],
        password : obj1[2],
        phone : req.body.From,
        address : obj1[3],
        image : req.body.MediaUrl
      };
      return user;
    }
  
    //   if (registration == 1){  
    //           if (text == 'Hello' || text == 'Hi' || text == 'Hey' || text == 'Heyy') {
    //           message = 'Hi!! This is the FarmFridge\n Type REGISTER to enter the worldwide portal for Selling your products at the best Price';
    //       } else if(text == 'REGISTER'){
    //           reg = counter+1;
    //           message = 'Pleae fill the form below:\n\nName :\nEmail:(optional)\nPassword:\nAddress:\n\nAnd send athe user image to build the profile(Optional)'
    //       } else if (reg == counter ){
    //           // code to add it to the database
    //           reg = 999
    //           let user = add_user(text)
  
    //           try{
    //               user.save()
    //               registration = 0;
    //               message = 'User sucessfully registered!!';
    //           } catch (err) {
    //           message = 'Failed to Sign up!! Please fill all the details in the form';
    //           }
    //       }
    //   } else if(registration == 0){
  
          if (text == 'Hello' || text == 'Hi' || text == 'Hey' || text == 'Heyy') {
      
              message = 'Hi!! Type\n\n ADD - To add fill the 7/12 form\n LIST - To list your assets\n SHOW:(product id) - To SHOW particular item\n DELETE:(product id) - To Delete the item';
            } else if (text == 'ADD' || text == 'Add') {
              
              opt = counter+1
              message = 'Fill the form:\n\nVillage:\nSurvey_no:\nsub division of:\nTaluka:\nName of occupant:\nkhata no.:\nName of the rent:\nAddress:\n';
            } else if (text == 'LIST' || text == 'List') {
                  
                  try{
                    let cust = product.findAll({'phone' : req.body.From})
                    console.log(cust);
                    message = cust;
                } catch (err) {
                  message = 'Failed to show the list!! Try again later';
                }
            } else if (text == 'SHOW') {
              
              message = "shows the value of a particular id";
            } else if (text == 'DELETE') {
              
              message = 'deletes the entry';
            } else if (text == 'Bye' || text == 'Tata') {
              
              message = 'Goodbye';
            } else if ( opt == counter) {
          
              // code to add it to the database
              opt = 999
              let pending = add_form(text)
          
              try{
                  database.ref('pending/'+ req.body.From).set(pending)
                  // console.log(res.json(saves);
                  message = 'Your Request is in pending state...Please wait for confirmation!!';
              } catch (err) {
                message = 'Failed to add to the list!! Try again later';
              }
          
            } else {
              
              message = "SORRY!! DID'NT GET YOU!!";
            }
    //   }
      //  else {
      //     message = "SORRY!! DID'NT GET YOU!!";
      // }
  
    req.session.counter = counter + 1;
    twiml.message(message)
  
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
  });

var port = process.env.PORT || 8000

app.listen(port, function(){
    console.log('App running on port ' + port)
})


