$SD.on('connected', (jsonObj) => connected(jsonObj));

function connected(jsonObj) {
    console.log(`[connected] ${JSON.stringify(jsonObj)}`);
    $SD.on('com.streamtools.webhooks.action.willAppear', (jsonObj) => action.onWillAppear(jsonObj));
    $SD.on('com.streamtools.webhooks.action.keyUp', (jsonObj) => action.onKeyUp(jsonObj));
    $SD.on('com.streamtools.webhooks.action.didReceiveSettings', (jsonObj) => action.onDidReceiveSettings(jsonObj));
    $SD.on('com.streamtools.webhooks.action.propertyInspectorDidAppear', (jsonObj) => {});
    $SD.on('com.streamtools.webhooks.action.propertyInspectorDidDisappear', (jsonObj) => {});
    $SD.on('com.streamtools.webhooks.action.sendToPlugin', (jsonObj) => action.onSendToPlugin(jsonObj));
};

const action = {
    onDidReceiveSettings: (jsonObj) => {
        console.log(`[onDidReceiveMessage] ${JSON.stringify(jsonObj)}`);
    },
    onWillAppear: (jsonObj) => {
        console.log(`[onWillAppear] ${JSON.stringify(jsonObj)}`);
        $SD.api.sendToPropertyInspector(jsonObj.context, Utils.getProp(jsonObj, "payload.settings", {}), jsonObj.action);
    },
    onSendToPlugin: (jsonObj) => {
        console.log(`[onSendToPlugin] ${JSON.stringify(jsonObj)}`);
        if(jsonObj.payload) {
            $SD.api.setSettings(jsonObj.context, jsonObj.payload);
        }
    },
    onKeyUp: (jsonObj) => {
        console.log(`[onKeyUp] ${JSON.stringify(jsonObj)}`);
        if (!jsonObj.payload.settings || !jsonObj.payload.settings.streamtoolsapikey) {
            $SD.api.showAlert(jsonObj.context);
            return;
        }
        let url = 'http://streamtools.local.com/webhook/'+jsonObj.payload.settings.widgettype+'/'+jsonObj.payload.settings.widgetid; 
        fetch(url, {
            "method": 'POST',
            "headers": {
                "content-type": "application/json",
                "X-API-KEY": jsonObj.payload.settings.streamtoolsapikey
            },
            "body": {
                "action": jsonObj.payload.settings.webhookpayload
            }
        }).then(result => $SD.api.showOk(jsonObj.context), error => $SD.api.showAlert(jsonObj.context));
    }
};