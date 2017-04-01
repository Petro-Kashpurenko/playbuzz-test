'use strict';

let express = require('express')
  , app = express()
  , bodyParser = require('body-parser')
  , port = process.env.PORT || 3000
  , options = {
      mySQL: {
        host     : 'mysql-test.playbuzz.com',
        user     : 'root',
        password : 'Sharona12#',
        database : 'analytics_task' // IMPORTANT! : please create your own new database, this is for example only
      }
    }
  ;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(require('./routes')(options));

app.listen(port, function() {
  console.log('Listening on port ' + port)
});