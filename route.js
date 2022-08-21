const express=require('express')
const router=express()

router.get('/add', function(request, response, next){

    db.query('SELECT * FROM books', function(error, data){

        var mysqldata = JSON.parse(JSON.stringify(data));

        var fileheader = ['lexicon', 'laxmikanth', 'politics', '12234', 'lexicon@gmail.com'];
        var jsondata = new data_exporter({fileheader});

        var csvdata = json_data.parse(mysqldata);

        response.setHeader("Content-Type", "text/csv");

        response.setHeader("Content-Disposition", "attachment; filename=data.csv");

        response.status(200).end(csvdata);

    });

});
module.exports = router;