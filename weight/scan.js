var user_height = 1.75;
var unused_rad = 0.1;
var rad_range = 1 - 2 * unused_rad;
var weight_range = 100;
var line_width = 14;
var panel;
var last_height;

function fill() {
    let b = document.querySelector("#start");
    b.style.width = document.documentElement.clientWidth + "px";
    b.style.height = document.documentElement.clientHeight / 7 + "px";
    b.style.fontSize = document.body.clientWidth / 10 + "px";
    b.style.borderStyle = "none"

    let c = document.getElementById("indicator");
    c.width = document.documentElement.clientWidth;
    c.height = document.documentElement.clientHeight / 2.1;
    draw_indicator(0);
    //move_pointer(91.2);
}

function move_pointer(weight) {
    let interval = 1;
    let length = 1200;
    let change = 150;
    let start;
    
    function move(stamp) {
        if (start === undefined) { start = stamp };
        const elapsed = stamp - start;

        if (elapsed <= change) {
            let t = elapsed / (change / interval);
            draw_indicator(weight * t);
        }
        else {
            let t = (elapsed - change) / ((length - change) / interval) * 20 + 2 * Math.PI;
            t = Math.pow(1.5, t);
            draw_indicator(weight * (Math.sin(t * t) / t + 1));
        }
        if (elapsed < length) {
            window.requestAnimationFrame(move);
        }
        else {
            draw_indicator(weight);
        }
    }

    window.requestAnimationFrame(move);
}

function draw_indicator(weight) {
    let c = document.getElementById("indicator");
    let r = Math.min(c.offsetWidth, c.offsetHeight) / 2.2;
    clr_canvas(c);
    draw_ranges(c, user_height, r);
    draw_pointer(c, weight, user_height, r * 0.92);
}

function draw_range(canvas, r, start, end, color, width) {
    let ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(canvas.offsetWidth / 2, canvas.offsetHeight / 2, r, start * Math.PI, end * Math.PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}

function draw_ranges(canvas, height, r) {
    if (panel === undefined && last_height != height) {
        let bd = 0.0025
        let ctx = canvas.getContext("2d");
        let div = getdiv(height);
        let udrad = div["underweight"] / weight_range * rad_range;
        let uwrad = div["overweight"] / weight_range * rad_range;
        let obrad = div["obesity"] / weight_range * rad_range;
        //border
        draw_range(canvas, r, 1 + unused_rad - bd, 1 + unused_rad + rad_range + bd, "black", line_width + 3);
        //underweight"
        draw_range(canvas, r, 1 + unused_rad, 1 + unused_rad + udrad, "gray", line_width);
        //normal
        draw_range(canvas, r, 1 + unused_rad + udrad, 1 + unused_rad + uwrad, "green", line_width);
        //overweight
        draw_range(canvas, r, 1 + unused_rad + uwrad, 1 + unused_rad + obrad, "yellow", line_width);
        //obesity
        draw_range(canvas, r, 1 + unused_rad + obrad, 1 + unused_rad + rad_range, "red", line_width);
        last_height = height;
        panel = ctx.getImageData();
    }
    else {
        ctx.putImageData(panel);
    }
}

function draw_pointer(canvas, weight, height, r) {
    let ctx = canvas.getContext("2d");
    //draw border
    ctx.beginPath();
    ctx.arc(canvas.offsetWidth / 2, canvas.offsetHeight / 2, 9, 0, 2 * Math.PI);
    ctx.fillStyle = "black"
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(canvas.offsetWidth / 2, canvas.offsetHeight / 2);
    ctx.lineTo(
        canvas.offsetWidth / 2 - 1.006 * r * Math.cos((rad_range * weight / weight_range + unused_rad) * Math.PI),
        canvas.offsetHeight / 2 - 1.006 * r * Math.sin((rad_range * weight / weight_range + unused_rad) * Math.PI)
    );
    ctx.lineWidth = 3;
    ctx.strokeStyle = "black"
    ctx.stroke();
    //draw pointer
    ctx.beginPath();
    ctx.arc(canvas.offsetWidth / 2, canvas.offsetHeight / 2, 8, 0, 2 * Math.PI);
    ctx.fillStyle = get_bmi_color(weight, height)
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(canvas.offsetWidth / 2, canvas.offsetHeight / 2);
    ctx.lineTo(
        canvas.offsetWidth / 2 - r * Math.cos((rad_range * weight / weight_range + unused_rad) * Math.PI),
        canvas.offsetHeight / 2 - r * Math.sin((rad_range * weight / weight_range + unused_rad) * Math.PI)
    );
    ctx.lineWidth = 2;
    ctx.strokeStyle = get_bmi_color(weight, height)
    ctx.stroke();
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
        return "gray";
    } else if (bmi >= 18.4 && bmi < 24) {
        return "green";
    } else if (bmi >= 24 && bmi < 28) {
        return "yellow";
    } else {
        return "red";
    }
}

function clr_canvas(canvas) {
    var cxt = canvas.getContext("2d");
    cxt.clearRect(0, 0, canvas.width, canvas.height);
}

function show_weight(weight) {
    let t = document.getElementById("weight");
    t.style.fontSize = document.documentElement.clientWidth / 8 + "px";
    t.innerText = weight + "KG";
    t.style.marginLeft = (document.documentElement.clientWidth - t.clientWidth) / 2 + "px";
}

function log(text) {
    //document.querySelector("log").innerHTML += "<p>" + text + "</p>";
    console.log(text);
}
async function scan() {
    draw_indicator(0);
    try {
        log('Requesting Bluetooth Scan');
        const scan = await navigator.bluetooth.requestLEScan({ "acceptAllAdvertisements": true } );
        navigator.bluetooth.addEventListener('advertisementreceived', event => {
            log('Advertisement received.');
            log('  Device Name: ' + event.device.name);
            log('  RSSI: ' + event.rssi);
            event.manufacturerData.forEach((valueDataView, key) => {
                if ((key & 0xff) == 0xdd) {
                    let weight = ((key & 0xff00) + valueDataView.getUint8(0)) / 10.0;
                    show_weight(weight);
                    move_pointer(weight);
                    log("weight is " + weight);
                    if (weight > 0) {
                        stopScan();
                    }
                }
            });
            log("-------------------------");
        });
        var t = setTimeout(stopScan, 10000);

        function stopScan() {
            log('Stopping scan...');
            scan.stop();
            log('Stopped.  scan.active = ' + scan.active);
            t && clearTimeout(t);
        }
    } catch (error) {
        log('Argh! ' + error);
    }
}