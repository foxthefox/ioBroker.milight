![Logo](admin/easybulb_logo.png)
# ioBroker.milight
[![NPM version](http://img.shields.io/npm/v/iobroker.milight.svg)](https://www.npmjs.com/package/iobroker.milight)
[![Downloads](https://img.shields.io/npm/dm/iobroker.milight.svg)](https://www.npmjs.com/package/iobroker.milight)
[![Build Status](https://travis-ci.org/foxthefox/ioBroker.milight.svg?branch=master)](https://travis-ci.org/foxthefox/ioBroker.milight)


[![NPM](https://nodei.co/npm/iobroker.milight.png?downloads=true)](https://nodei.co/npm/iobroker.milight/)

adapter for ioBroker for LED-lamps like milight, easybulb, limitless

## Installation:
from npm
* npm install iobroker.milight

actual version from github
* npm install https://github.com/foxthefox/ioBroker.milight/tarball/master --production

## common Settings:
in admin page
* IP-Adress-> IP of bridge
* Port -> port of bridge
* delaybetweenPackages -> ms delay between UDP packages (100ms for v5)
* repeatPackage -> number of repetitions (1 for v5)
* version of the milight protocol v5 or v6 -> sets automatically the corresponding port

* the type of bulbs in the zones
+ basic = bridge ONLY for zone 1 and v6
+ RGBWW = full color bulb with white LED and color temperature adjustment (increase color temp means cooler coloring), ONLY in v6
+ RGB = pure color bulb without white ONLY for zone 1
+ RGBW = color bulb with white LED
+ White = pure white bulb with color temperature adjustment (increase color temp means cooler coloring)


## States in Version 6

|               available state               |           basic/bridge           |              White             |               RGB              |                  RGBW                 |                  RGBWW                 |
|:-------------------------------------------:|:--------------------------------:|:------------------------------:|:------------------------------:|:-------------------------------------:|:--------------------------------------:|
|               ON/OFF as switch              |      state(zone1),  function     |      state(zone),  function    |     state(zone1),  function    |         state(zone),  function        |          state(zone),  function        |
|                 ON as button                |         on(zone1),  native       |        on(zone),  native       |        on(zone1),  native      |            on(zone),  native          |            on(zone),  native           |
|                OFF as button                |        off(zone1),  native       |        off(zone),  native      |       off(zone1),  native      |           off(zone),  native          |            off(zone),  native          |
|          colorMode as boolean state         |                                  |                                |                                |  colorMode (0=nightMode, 1=whiteMode) |  colorMode  (0=nightMode, 1=whiteMode) |
|              maxWhite as button             |                                  |     maxBright(zone), native    |                                |                                       |                                        |
|             whiteMode as button             |     whiteMode(zone1), native     |                                |                                |        whiteMode(zone), native        |         whiteMode(zone), native        |
|             nightMode as button             |                                  |     nightMode(zone), native    |                                |        nightMode(zone), native        |         nightMode(zone), native        |
|         brightness as value (0-100)         |     brightness(zone), native     |                                |                                |        brightness(zone),  native      |        brightness(zone),  native       |
|            color as 3 hex values            |        color(zone),  native      |                                |       color(zone),  native     |          color(zone),  native         |           color(zone),  native         |
| rgb as combined value (#000000 -   #FFFFFF) |         rgb(zone),  native       |                                |        rgb(zone),  native      |           rgb(zone),  native          |            rgb(zone),  native          |
|                mode as value                |        mode(zone),  native       |                                |                                |           mode(zone),  native         |           mode(zone),  native          |
|            modeSpeedUp as button            |                                  |    modeSpeedUp(zone), native   |                                |       modeSpeedUp (zone), native      |        modeSpeedUp (zone), native      |
|           modeSpeedDown as button           |                                  |  modeSpeedDown (zone),  native |                                |      modeSpeedDown(zone),  native     |       modeSpeedDown(zone),  native     |
|                link as button               |                                  |                                |                                |           link(zone),  native         |           link(zone),  native          |
|               unlink as button              |                                  |                                |                                |          unlink(zone),  native        |          unlink(zone),  native         |
|         saturation as value (0-100)         |                                  |                                |                                |                                       |        Saturation (zone),  native      |
|          colorTemp as value (0-100)         |                                  |                                |                                |                                       |         colorTemp (zone), native       |
|            brightnessUp as button           |   brightnessUp (zone), function  |   brightnessUp (zone), native  |   brightnessUp (zone), native  |      brightnessUp (zone), function    |      brightnessUp (zone), function     |
|           brightnessDown as button          |  brightnessDown (zone), function |  brightnessDown (zone), native |  brightnessDown (zone), native |     brightnessDown (zone), function   |     brightnessDown (zone), function    |
|              colorUp as button              |      colorUp(zone), function     |                                |                                |        colorUp(zone),  function       |         colorUp(zone),  function       |
|             color Down as button            |    color Down(zone), function    |                                |   color Down(zone), function   |       color Down(zone), function      |                                        |
|            saturationUp as button           |                                  |                                |                                |                                       |      saturationUp (zone), function     |
|           saturationDown as button          |                                  |                                |                                |                                       |     saturationDown (zone), function    |
|            colorTempUp as button            |                                  |    colorTempUp (zone), native  |                                |                                       |       colorTempUp (zone), function     |
|           colorTempDown as button           |                                  |  colorTempDown (zone),  native |                                |                                       |      colorTempDown (zone), function    |

## States in Version 5/ Version 4

|                available state                |           RGB           |          White          |                   RGBW                   |
|:---------------------------------------------:|:-----------------------:|:-----------------------:|:----------------------------------------:|
|                ON/OFF as switch               |  state(zone), function  |  state(zone), function  |           state(zone), function          |
|                  ON as button                 |     on(zone), native    |     on(zone), native    |             on(zone), native             |
|                 OFF as button                 |    off(zone), native    |    off(zone), native    |             off(zone), native            |
|           colorMode as boolean state          |                         |                         | colorMode (0=nightMode, 1=color(hue=55)) |
|               maxWhite as button              |                         | maxBright(zone), native |                                          |
|              whiteMode as button              |                         |                         |          whiteMode(zone), native         |
|              nightMode as button              |                         |                         |          nightMode(zone), native         |
|           color as hue value (0-255)          |                         |                         |                hue, native               |
|  rgb as combined value (#000000 -   #FFFFFF)  |                         |                         |                rgb, native               |
|             colorTempUp as button             |                         |      warmer, native     |                                          |
|            colorTempDown as button            |                         |      cooler, native     |                                          |
|          brightness as value (0-100)          |                         |                         |            brightness, native            |
| brightness   as value (0-100), extended range |                         |   brightness2, native   |                                          |
|            effectModeNext as button           |                         |                         |          effectModeNext, native          |
|               speedUp as button               |     speedUp, native     |                         |           effectSpeedUp, native          |
|              speedDown as button              |    speedDown, native    |                         |          effectSpeedDown, native         |
|             brightnessUp as button            |   brightnessUp, native  |   brightnessUp, native  |                                          |
|            brightnessDown as button           |  brightnessDown, native |  brightnessDown, native |                                          |
|            effectModeNext as button           |  effectSpeedUp, native  |                         |                                          |
|            effectModePrev as button           | effectSpeedDown, native |                         |                                          |


effectSpeedUp/Down has different meaning (for rgb changes the mode, for rgbw it changes the speed)! 

## Configuration:
in admin page of adapter
version 5 also to be used for v4 lamps

## TODO:
* widget matching the further adapter objects(e.g. v6)

## known issues:
* color bar in widget to be corrected


## Changelog:
### upcomming version 0.3.0
* (foxthefox) cleanup of states
* (foxthefox) added white/rgb lamp
* (foxthefox) correction of mismatch RGBW/RGBWW in v6

### 0.2.2/0.2.1
* (foxthefox) debug messages with v5/v6 prefix; v6 colorset->colormode

### 0.2.0 
* (bluefox) discovery for v6

### 0.1.1
* (foxthefox) switch lamp on with full brightness -> checkbox in admin for v5

### 0.1.0
* (foxthefox) tested with bridge version 4 and protocol version v5
* (bluefox)v6 implementation
* (foxthefox) node-milight-promise 0.0.9
* (foxthefox) jqui widget RGBW lamp

### 0.0.1
* (foxthefox) initial setup
