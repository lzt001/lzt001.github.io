function fill() {
    let b = document.querySelector("#start");
    b.style.width = document.body.clientWidth + "px";
    b.style.height = window.screen.height / 7 + "px";
    b.style.fontSize = "20px"
    document.querySelector("#weight").fontSize = "40px"
}

function log(text) {
    //document.querySelector("log").innerHTML += "<p>" + text + "</p>";
    console.log(text);
}
async function scan() {
    try {
        log('Requesting Bluetooth Scan');
        const scan = await navigator.bluetooth.requestLEScan({
            filters: [{
                name: "dr01"
            }]
        });
        navigator.bluetooth.addEventListener('advertisementreceived', event => {
            log('Advertisement received.');
            log('  Device Name: ' + event.device.name);
            log('  RSSI: ' + event.rssi);
            event.manufacturerData.forEach((valueDataView, key) => {
                let weight = ((key & 0xff00) + valueDataView.getUint8(0)) / 10.0;
                document.querySelector("#weight").innerText = weight + "KG"
                log("weight is " + weight);
                if (weight > 0) {
                    stopScan();
                }
            });
            log("-------------------------");
        });
        setTimeout(stopScan, 10000);

        function stopScan() {
            log('Stopping scan...');
            scan.stop();
            log('Stopped.  scan.active = ' + scan.active);
        }
    } catch (error) {
        log('Argh! ' + error);
    }
}