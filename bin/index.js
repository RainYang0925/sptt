#!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var cli = require('commander');

require('../lib/cli')(cli);
cli.parse(process.argv);

process.on('uncaughtException',function(e){
  console.log(e);
});