/*
    ioBroker.milight Widget-Set
    version: "0.0.1"
    Copyright foxthefox 
    adapted from iobroker.vis-jqui, jqui-mfd

*/

"use strict";



// add translations for edit mode

if (vis.editMode) {

    $.extend(systemDictionary, {
        "oid-level":       {"en": "brightness", "de": "Helligkeit"},
        "oid-colormode":    {"en": "mode",  "de": "Modus"},
        "oid-color":        {"en": "color",      "de": "Farbe"},
        "oid-disco":        {"en": "disco mode",      "de": "Disco"},
        "oid-speedup":      {"en": "speed up",      "de": "speed up"},
        "oid-speeddown":    {"en": "speed down",      "de": "speed down"}        
    });
};

vis.binds.milightui = {

    version: "0.0.1",

    showVersion: function() {

        if (vis.binds.milightui.version) {
            console.log('Milight widget version: ' + vis.binds.milightui.version);
            vis.binds.milightui.version = null;
        }
    },

    milightColormode: function (el, oid) {
            var $hue = $(el).parent().find('.hue-mode-hue');
            if (vis.states.attr(oid + '.val') == 'hs') {
                $hue.hide();
            } else {
                $hue.show();
            }

            vis.states.bind(oid + '.val', function (e, newVal, oldVal) {
                if (newVal == 'hs') {
                    $hue.hide();
                } else {
                    $hue.show();
                }
            });
        }
    };

vis.binds.milightui.showVersion();
