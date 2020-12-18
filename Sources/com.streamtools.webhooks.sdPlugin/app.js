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
            
            let icon = "action@2x";
            let url = "https://app.streamtools.com/Resources/App/Theme/STools/img/{icon}.png";
            if (jsonObj.payload['widgettype'] == 'flipcoin') {
                icon = "C11B_Coin_head";
                url = "https://app.streamtools.com/Resources/App/Theme/STools/img/flipcoin/{icon}_a.png";
            } else if (jsonObj.payload['widgettype'] == 'diceroller') {
                icon = "C12B_Dice_1";
                url = "https://app.streamtools.com/Resources/App/Theme/STools/img/diceroller/{icon}_a.png";
            }
            toDataURL(url.replace("{icon}", icon),
                function (dataUrl) {
                    $SD.api.setImage(jsonObj.context, dataUrl);
                }
            );
        }
    },
    onKeyUp: (jsonObj) => {
        console.log(`[onKeyUp] ${JSON.stringify(jsonObj)}`);
        if (!jsonObj.payload.settings || !jsonObj.payload.settings.streamtoolsapikey) {
            $SD.api.showAlert(jsonObj.context);
            return;
        }
        let url = 'https://app.streamtools.com/webhook/'+jsonObj.payload.settings.widgettype+'/'+jsonObj.payload.settings.widgetid+'/'; 
        fetch(url, {
            "method": 'POST',
            "headers": {
                "content-type": "application/json",
                "X-API-KEY": jsonObj.payload.settings.streamtoolsapikey
            },
            "body": JSON.stringify({"action": jsonObj.payload.settings.webhookpayload})
        }).then(result => $SD.api.showOk(jsonObj.context), error => $SD.api.showAlert(jsonObj.context));
    }
};

function toDataURL(src, callback, outputFormat) {
    let img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
        let canvas = document.createElement('CANVAS');
        let ctx = canvas.getContext('2d');
        let dataURL;
        canvas.height = this.naturalHeight;
        canvas.width = this.naturalWidth;
        ctx.drawImage(this, 0, 0);
        dataURL = canvas.toDataURL(outputFormat);
        callback(dataURL);
    };
    img.src = src;
    if (img.complete || img.complete === undefined) {
        img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
        img.src = src;
    }
}