![Logo](admin/easybulb_logo.png)
# ioBroker.milight
=================
adapter for ioBroker for LED-lamps like milight, easybulb, limitless

#ALPHA 

##Installation:

npm install https://github.com/foxthefox/ioBroker.milight/tarball/master --production

##Settings:

* IP-Adress-> IP of bridge
* Port -> port of brifge
* delaybetweenPackages -> ms delay between UDP packages
* repeatPackage -> number of repetitions

##Configuration:
in io-package.json
* groups-> 4 possible zones of lights
* ltype -> type of lamp -> only RGBW supported
* rooms -> name of room or lamp

##TODO:
* support other type of lamp
* widget matching the adapter objects

##known issues:
lamp switches of after ca. 30s, maybe udp packages not sent correctly (version 3 of bridge used)


##Changelog:
### intermediate
* node-milight-promise 0.0.9
* jqui widget
###0.0.1
* initial setup
