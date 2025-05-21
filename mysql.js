const MySQL = require('mysql');

const connection = MySQL.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "presentrpg"
});

connection.connect(function(error) {
    if (error) throw error;
    console.log("Connected mysql.");
});

function send_query(sql) {
    connection.query(sql, (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
        // console.log(results);
        return results;
    });
}

function query(query) 
{
    // connection.query(query, function(err,rows){
    //     if (err) throw err;
    //     return callback(rows);
    // });

    return new Promise((resolve, reject) => {
    
        connection.query(query, (err, rows) => {
            if (err) {
                reject(err)
            } else {
                resolve(rows);
            }
        })
    
    })
}

module.exports = {
    query: query
}