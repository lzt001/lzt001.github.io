var user_height = 1.75;
var unused_rad = 0.1;
var rad_range = 1 - 2 * unused_rad;
var weight_range = 100;
var line_width = 14;

function fill() {
    let b = document.querySelector("#start");
    b.style.width = document.body.clientWidth + "px";
    b.style.height = window.screen.height / 7 + "px";
    b.style.fontSize = document.body.clientWidth / 10 + "px";
    document.querySelector("#weight").style.fontSize = document.body.clientWidth / 8 + "px";
    let c = document.getElementById("indicator");
    c.setAttribute("width", document.body.clientWidth);
    c.setAttribute("height", window.screen.height / 2.1);
    draw_ranges(c, user_height);
    draw_pointer(c, 91.2, user_height);
}

function draw_range(canvas, r, start, end, color, width) {
    let ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(canvas.offsetWidth / 2, canvas.offsetHeight / 2, r, start * Math.PI, end * Math.PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}

function draw_ranges(canvas, height) {
    let bd = 0.0025
    let ctx = canvas.getContext("2d");
    let r = Math.min(canvas.offsetWidth, canvas.offsetHeight) / 2.2;
    let div = getdiv(height);
    let udrad = div["underweight"] / weight_range * rad_range;
    let uwrad = div["overweight"] / weight_range * rad_range;
    let obrad = div["obesity"] / weight_range * rad_range;
    //border
    draw_range(canvas, r, 1 + unused_rad - bd, 1 + unused_rad + rad_range + bd, "black", line_width + 4);
    //underweight"
    draw_range(canvas, r, 1 + unused_rad, 1 + unused_rad + udrad, "gray", line_width);
    //normal
    draw_range(canvas, r, 1 + unused_rad + udrad, 1 + unused_rad + uwrad, "green", line_width);
    //overweight
    draw_range(canvas, r, 1 + unused_rad + uwrad, 1 + unused_rad + obrad, "yellow", line_width);
    //obesity
    draw_range(canvas, r, 1 + unused_rad + obrad, 1 + unused_rad + rad_range, "red", line_width);
}

function draw_pointer(canvas, weight, height) {
    let ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(canvas.offsetWidth / 2, canvas.offsetHeight / 2, 8, 0, 2 * Math.PI);
    ctx.fillStyle = get_bmi_color(weight, height)
    ctx.lineWidth = 1;
    ctx.fill();
}

function getdiv(height) {
    let ud = 18.4 * height * height;
    let ow = 24 * height * height;
    let ob = 28 * height * height;
    return {
        "underweight": ud,
        "overweight": ow,
        "obesity": ob
    };
}

function get_bmi_color(weight, height) {
    let bmi = weight / (height * height);
    if (bmi < 18.4) {
        return  "gray";
    }
    else if (bmi >= 18.4 && bmi < 24) {
        return "green";
    }
    else if (bmi >= 24 && bmi < 28) {
        return "yellow";
    }
    else {
        return "red";
    }
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