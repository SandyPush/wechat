'use strict'


var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));


fs.readFileAsync('./a/b/m.txt')
    .then(function(fileData){
        return fs.mkdirAsync('./a/b');
    })
    .then(function(){
        return fs.writeFileAsync('./a/b/message.txt');
    })