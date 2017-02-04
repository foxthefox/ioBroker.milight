![Logo](admin/easybulb_logo.png)
# ioBroker.milight
=================
[![NPM version](http://img.shields.io/npm/v/iobroker.milight.svg)](https://www.npmjs.com/package/iobroker.milight)
[![Downloads](https://img.shields.io/npm/dm/iobroker.milight.svg)](https://www.npmjs.com/package/iobroker.milight)
[![Build Status](https://travis-ci.org/foxthefox/ioBroker.milight.svg?branch=master)](https://travis-ci.org/foxthefox/ioBroker.milight)


[![NPM](https://nodei.co/npm/iobroker.milight.png?downloads=true)](https://nodei.co/npm/iobroker.milight/)

adapter for ioBroker for LED-lamps like milight, easybulb, limitless

##Installation:
from npm
* npm install iobroker.milight

actual version from github
* npm install https://github.com/foxthefox/ioBroker.milight/tarball/master --production

##Settings:
in admin page
* IP-Adress-> IP of bridge
* Port -> port of bridge
* delaybetweenPackages -> ms delay between UDP packages (100ms for v5)
* repeatPackage -> number of repetitions (1 or 2 for v5)

##Configuration:
in admin page of adapter
version 5 also to be used for v4 lamps

##TODO:
* support other type of lamp
* widget matching the further adapter objects

##known issues:
* color bar in widget to be corrected


##Changelog:
### 0.1.1 ongoing
* switch lamp on with full brightness -> checkbox in admin for v5

### 0.1.0
* tested with bridge version 4 and protocol version v5
* v6 implementation
* node-milight-promise 0.0.9
* jqui widget RGBW lamp

###0.0.1
* initial setup
