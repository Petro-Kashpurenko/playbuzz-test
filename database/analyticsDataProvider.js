'use strict';

const mysql = require('mysql')
  , Promise = require('promise');

let analyticsDataProvider = function(options) {

  return {
    collectView: collectView,
    getPageViews: getPageViews
  };

  function collectView (viewData) {
    return new Promise((resolve, reject) => {
      const connection = mysql.createConnection(options.mySQL);
      connection.connect();

      connection.query("insert into events set ?", viewData, function(err) {

        if (!err) {
          return resolve({message: 'Data successfully collected.'})
        }
        else {
          return reject({message: 'Error while performing Query.', err});
          // err is for debug only, do not use this test code for production.
        }

      });

      connection.end();
    });
  }

  function getPageViews (config) {
    let queryString;

    return new Promise((resolve, reject) => {

      if (config.value) {
        queryString = `SELECT COUNT(*) as count FROM events WHERE ${config.field} = '${config.value}'`
      }
      else {
        queryString = `SELECT COUNT(*) as count,${config.field} FROM analytics_task.events GROUP BY ${config.field} ORDER BY 1 DESC`;
        if(config.limit) {
          queryString += ` LIMIT ${config.limit}`
        }
      }

      const connection = mysql.createConnection(options.mySQL);
      connection.connect();

      connection.query(queryString, function(err, rows, fields) {

        if (!err) {
          return resolve(rows.length > 1 ? rows : rows[0])
        }
        else {
          return reject({message: 'Error while performing Query.'});
        }

      });

      connection.end();
    });
  }

};

module.exports = analyticsDataProvider;