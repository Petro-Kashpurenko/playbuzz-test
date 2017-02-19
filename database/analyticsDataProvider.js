var mysql      = require('mysql');

var analyticsDataProvider = {};

analyticsDataProvider.get = function(cb) {

    var connection = mysql.createConnection({
        host     : 'mysql-test.playbuzz.com',
        user     : 'root',
        password : 'Sharona12#',
        database : 'analytics' // IMPORTANT! : please create your own new database, this is for example only
    });

    connection.connect();

    connection.query("select col_2 from demo_events_table where col_1 = 'key'", function(err, rows, fields) {

        if (!err) {
            cb(rows[0]['col_2'])
            // console.log('data recived is: ', rows);
        }
        else
            console.log('Error while performing Query.');

    });

    connection.end();
}

module.exports = analyticsDataProvider