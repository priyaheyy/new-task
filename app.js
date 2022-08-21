const express = require('express')
const app = express()
const bodyparser = require('body-parser')
const fs = require('fs');
const csv = require('fast-csv');
const mysql = require('mysql')
const multer = require('multer')
const path = require('path')
const add=require('./route.js')


app.use(express.static("./public"))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({
    extended: true
}))


const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345",
    database: "test"
})
db.connect(function (err) {
    if (err) {
        return console.error('error: ' + err.message);
    }
    console.log('Connected to the MySQL server.');
})
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './uploads/')
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

var upload = multer({
    storage: storage
});


db.connect(function(err) {
    if (err) console.log(err);
    console.log("Connected!");
    var sql = "CREATE TABLE books (Books VARCHAR(255), Author VARCHAR(255), Magazine VARCHAR(255), ISBN INT, email VARCHAR(255))";
    db.query(sql, function (err, result) {
      if (err) console.log(err);
      console.log("Table created");
    });
  });

//router for home page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// upload csv to database
app.post('/uploadfile', upload.single("uploadfile"), (req, res) => {
    UploadCsvDataToMySQL(__dirname + '/uploads/' + req.file.filename);
    console.log('CSV file data has been uploaded in mysql database ' + err);
});

//find books on the basis of ISBN
app.post('/isbn', (req, res) => {
    console.log(req.body)
    var rb = req.body
    var k = Object.keys(rb)
    console.log(rb[k[0]]) //100
    console.log(k[0])   //100
    var res = k[0]
        let sql = 'SELECT Books FROM books WHERE?'
        let post = {
            isbn: res
        }
        db.query(sql, post, (err, res) => {
            if (err) console.log(err)
            console.log('successss');
            console.log(res);
        });
    });

//get books, magazine on the basis of email id of the author
app.post('/getdetails', (req, res) => {
    //console.log(req.body.email) 
    // db.connect(function (err) {
        var email = req.body.email
        //console.log(email)
        //if (err) console.log(err)

        let sql = 'SELECT Books, Magazine FROM books WHERE?'
        let post = {
            email: req.body.email
        }
        db.query(sql, post, (err, res) => {
            if (err) console.log(err)
            console.log('success');
            console.log(res);
        });
    });


//adding new data to csv file and reflecting that data into the database
app.use('/adddata',(req,res)=> {
    let post={Books:'somexyz', Author:'dekhmukh pande', Magazine:'nationality', ISBN:'1213', email:'pande@gmail.com'}
    let sql='INSERT INTO books SET?';
    let query=db.query(sql,post,(err,result)=>{
        if(err) console.log(err)
        res.send('data was posted into csv file')
    })
})

app.route(add)

function UploadCsvDataToMySQL(filePath) {
    let stream = fs.createReadStream(filePath);
    let csvData = [];
    let csvStream = csv
        .parse()
        .on("data", function (data) {
            csvData.push(data);
        })
        .on("end", function () {
            csvData.shift();

            // Open the MySQL connection
            db.connect((error) => {
                if (error) {
                    console.error(error);
                } else {
                    let query = 'INSERT INTO books (Books, Author, Magazine, ISBN, email) VALUES ?';
                    db.query(query, [csvData], (error, response) => {
                        console.log(error || response);
                    });
                }
            });
        
            fs.unlinkSync(filePath)
        });

    stream.pipe(csvStream);
}

app.listen(3000)