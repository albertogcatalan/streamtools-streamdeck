/* global $CC, Utils, $SD */

/**
 * Here are a couple of wrappers we created to help ypu quickly setup
 * your plugin and subscribe to events sent by Stream Deck to your plugin.
 */

 /**
  * The 'connected' event is sent to your plugin, after the plugin's instance
  * is registered with Stream Deck software. It carries the current websocket
  * and other information about the current environmet in a JSON object
  * You can use it to subscribe to events you want to use in your plugin.
  */

$SD.on('connected', (jsonObj) => connected(jsonObj));

function connected(jsn) {
    /** subscribe to the willAppear and other events */
    $SD.on('com.streamtools.webhooks.action.willAppear', (jsonObj) => action.onWillAppear(jsonObj));
    $SD.on('com.streamtools.webhooks.action.keyUp', (jsonObj) => action.onKeyUp(jsonObj));
    $SD.on('com.streamtools.webhooks.action.sendToPlugin', (jsonObj) => action.onSendToPlugin(jsonObj));
    $SD.on('com.streamtools.webhooks.action.didReceiveSettings', (jsonObj) => action.onDidReceiveSettings(jsonObj));
    $SD.on('com.streamtools.webhooks.action.propertyInspectorDidAppear', (jsonObj) => {
        console.log('%c%s', 'color: white; background: black; font-size: 13px;', '[app.js]propertyInspectorDidAppear:');
    });
    $SD.on('com.streamtools.webhooks.action.propertyInspectorDidDisappear', (jsonObj) => {
        console.log('%c%s', 'color: white; background: red; font-size: 13px;', '[app.js]propertyInspectorDidDisappear:');
    });
};

/** ACTIONS */

const action = {
    settings:{},
    onDidReceiveSettings: function(jsonObj) {
        console.log(`[onDidReceiveMessage] ${JSON.stringify(jsonObj)}`);
    },

    /** 
     * The 'willAppear' event is the first event a key will receive, right before it gets
     * showed on your Stream Deck and/or in Stream Deck software.
     * This event is a good place to setup your plugin and look at current settings (if any),
     * which are embedded in the events payload.
     */

    onWillAppear: function (jsonObj) {
        $SD.api.sendToPropertyInspector(jsonObj.context, Utils.getProp(jsonObj, "payload.settings", {}), jsonObj.action);
    },

    onKeyUp: function (jsonObj) {
        if (!jsonObj.payload.settings || !jsonObj.payload.settings.streamtoolsapikey || !jsonObj.payload.settings.widgetid) {
            $SD.api.showAlert(jsonObj.context);
            return;
        }
        let url = 'http://streamtools.local.com/webhook/'+jsonObj.payload.settings.widgettype+'/'+jsonObj.payload.settings.widgetid; 
        fetch(url, {
            "method": 'POST',
            "headers": {
                "content-type": "application/json",
                'X-API-KEY': jsonObj.payload.settings.streamtoolsapikey
            },
            "body": {'action': jsonObj.payload.settings.webhookpayload}
        }).then(result => $SD.api.showOk(jsonObj.context), error => $SD.api.showAlert(jsonObj.context));
    },

    onSendToPlugin: function (jsonObj) {
        /**
         * this is a message sent directly from the Property Inspector 
         * (e.g. some value, which is not saved to settings) 
         * You can send this event from Property Inspector (see there for an example)
         */ 

        if(jsonObj.payload) {
            $SD.api.setSettings(jsonObj.context, jsonObj.payload);
        }
    },

    /**
     * This snippet shows, how you could save settings persistantly to Stream Deck software
     * It is not used in this example plugin.
     */

    saveSettings: function (jsn, sdpi_collection) {
        console.log('saveSettings:', jsn);
        if (sdpi_collection.hasOwnProperty('key') && sdpi_collection.key != '') {
            if (sdpi_collection.value && sdpi_collection.value !== undefined) {
                this.settings[sdpi_collection.key] = sdpi_collection.value;
                console.log('setSettings....', this.settings);
                $SD.api.setSettings(jsn.context, this.settings);
            }
        }
    },
};

