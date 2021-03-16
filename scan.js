function log(text) {
    document.querySelector("log").innerHTML += "<p>" + text + "</p>"
}
async function scan() {
    let options = {};
    options.filters = [{
        name: "dr01"
    }];
    try {
        log('Requesting Bluetooth Scan with options: ' + JSON.stringify(options));
        const scan = await navigator.bluetooth.requestLEScan(options);
        log('Scan started with:');
        log(' active: ' + scan.active);
        log(' keepRepeatedDevices: ' + scan.keepRepeatedDevices);
        log(' filters: ' + JSON.stringify(scan.filters));
        navigator.bluetooth.addEventListener('advertisementreceived', event => {
            log('Advertisement received.');
            log('  Device Name: ' + event.device.name);
            log('  RSSI: ' + event.rssi);
            event.manufacturerData.forEach((valueDataView, key) => {
                //logDataView('Manufacturer', key, valueDataView);
                log()
            });
        });
        setTimeout(stopScan, 5000);

        function stopScan() {
            log('Stopping scan...');
            scan.stop();
            log('Stopped.  scan.active = ' + scan.active);
        }
    } catch (error) {
        log('Argh! ' + error);
    }
}
/* Utils */
const logDataView = (labelOfDataSource, key, valueDataView) => {
    const hexString = [...new Uint8Array(valueDataView.buffer)].map(b => {
        return b.toString(16).padStart(2, '0');
    }).join(' ');
    const textDecoder = new TextDecoder('ascii');
    log('comp: ' + key);
    log("hex: " + hexString)
};

function isWebBluetoothEnabled() {
    if (navigator.bluetooth) {
        return true;
    } else {
        ChromeSamples.setStatus('Web Bluetooth API is not available.\n' + 'Please make sure the "Experimental Web Platform features" flag is enabled.');
        return false;
    }
}