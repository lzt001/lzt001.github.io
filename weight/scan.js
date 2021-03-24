var user_height = localStorage.getItem("height");
var user_age = localStorage.getItem("age");
var rad_range = 1.7;
var start_rad = (2 - rad_range) / 2 + 0.5;
var weight_range = 100;
var weight_bais = 30;
var panel;
var last_height = 0;
var i_gray = "gray";
var i_green = "green";
var i_yellow = "yellow";
var i_red = "red";

function fill() {
    //btn pos setting
    let margin_width = parseInt(getComputedStyle(document.body, null).marginLeft);
    margin_width += parseInt(getComputedStyle(document.body, null).marginRight);
    let margin_height = parseInt(getComputedStyle(document.body, null).marginTop);
    margin_height += parseInt(getComputedStyle(document.body, null).marginBottom);
    //start scanning btn
    let btn = document.getElementById("start");
    btn.style.width = Math.floor((document.documentElement.clientWidth - margin_width) / 2) + "px";
    btn.style.height = Math.floor((document.documentElement.clientHeight - margin_height) / 12) + "px";
    btn.style.fontSize = Math.floor(document.body.clientWidth / 13) + "px";
    //setting btn
    btn = document.getElementById("setting");
    btn.style.width = Math.floor((document.documentElement.clientWidth - margin_width) / 2) - 6 + "px";
    btn.style.height = Math.floor((document.documentElement.clientHeight - margin_height) / 12) + "px";
    btn.style.fontSize = Math.floor(document.body.clientWidth / 13) + "px";
    //indicator canvas
    let c = document.getElementById("indicator");
    let length = Math.min(document.documentElement.clientWidth - margin_width, document.documentElement.clientHeight - margin_height);
    c.style.width = length + "px";
    c.style.height = length + "px";
    c.width = Math.floor(length * window.devicePixelRatio);
    c.height = Math.floor(length * window.devicePixelRatio);
    draw_indicator(0);
}

function setting() {
    let win = document.getElementById("settingwin");
    let border = 10;
    win.style.top = border + "px";
    win.style.left = border + "px";
    border = document.documentElement.clientWidth - 2 * (border + parseInt(win.style.borderLeftWidth) + parseInt(win.style.marginLeft))
    win.style.width = border + "px";
    win.style.height = win.style.width;
    win.style.visibility = "visible";
}

function move_pointer(weight) {
    let interval = 1;
    let length = Math.floor(weight * 12);
    let change = Math.floor(length * 0.2);
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
    let r = Math.min(c.width, c.height) / 2.1;
    clr_canvas(c);
    draw_ranges(c, user_height, r);
    draw_pointer(c, weight, user_height, r * 0.92);
}

function draw_range(canvas, r, start, end, color, width) {
    let ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, r, start * Math.PI, end * Math.PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}

function draw_ranges(canvas, height, r) {
    let ctx = canvas.getContext("2d");
    if (panel === undefined && last_height != height) {
        let bd = 0.0013;
        let line_width = 45;
        let div = getdiv(height);
        let udrad = div["underweight"] / weight_range * rad_range;
        let uwrad = div["overweight"] / weight_range * rad_range;
        let obrad = div["obesity"] / weight_range * rad_range;
        //border
        draw_range(canvas, r, start_rad - bd, start_rad + rad_range + bd, "black", line_width + 4);
        //underweight"
        draw_range(canvas, r, start_rad, start_rad + udrad, i_gray, line_width);
        //normal
        draw_range(canvas, r, start_rad + udrad, start_rad + uwrad, i_green, line_width);
        //overweight
        draw_range(canvas, r, start_rad + uwrad, start_rad + obrad, i_yellow, line_width);
        //obesity
        draw_range(canvas, r, start_rad + obrad, start_rad + rad_range, i_red, line_width);
        last_height = height;
        panel = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    else {
        ctx.putImageData(panel, 0, 0);
    }
}

function draw_pointer(canvas, weight, height, r) {
    let ctx = canvas.getContext("2d");
    let ctr_x = canvas.width / 2;
    let ctr_y = canvas.height / 2;
    let line_width = 6;
    let bd = 1.004
    //draw num
    ctx.lineWidth = line_width;
    ctx.font = Math.floor(canvas.width / 12) + "px Arial";
    ctx.strokeStyle = "black";
    let txt = weight.toFixed(1) + "KG";
    let x = ctr_x - ctx.measureText(txt).width / 2;
    let y = canvas.height / 1.1;
    ctx.strokeText(txt, x, y);
    ctx.fillStyle = get_bmi_color(weight, height);
    ctx.fillText(txt, x, y);


    x = r * Math.cos((rad_range * weight / weight_range + start_rad) * Math.PI);
    y = r * Math.sin((rad_range * weight / weight_range + start_rad) * Math.PI);

    //draw border
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 9, 0, 2 * Math.PI);
    ctx.fillStyle = "black"
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.lineTo(ctr_x + bd * x, ctr_y + bd * y);
    ctx.lineWidth = line_width + 2;
    ctx.strokeStyle = "black"
    ctx.stroke();
    //draw pointer
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 8, 0, 2 * Math.PI);
    ctx.fillStyle = get_bmi_color(weight, height)
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.lineTo(ctr_x + x, ctr_y + y);
    ctx.lineWidth = line_width;
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
        return i_gray;
    } else if (bmi >= 18.4 && bmi < 24) {
        return i_green;
    } else if (bmi >= 24 && bmi < 28) {
        return i_yellow;
    } else {
        return i_red;
    }
}

function clr_canvas(canvas) {
    var cxt = canvas.getContext("2d");
    cxt.clearRect(0, 0, canvas.width, canvas.height);
}

function log(text) {
    //document.querySelector("log").innerHTML += "<p>" + text + "</p>";
    console.log(text);
}

async function scan() {
    draw_indicator(0);
    try {
        log('Requesting Bluetooth Scan');
        const scan = await navigator.bluetooth.requestLEScan({ "acceptAllAdvertisements": true });
        navigator.bluetooth.addEventListener('advertisementreceived', event => {
            log('Advertisement received.');
            log('  Device Name: ' + event.device.name);
            log('  RSSI: ' + event.rssi);
            event.manufacturerData.forEach((valueDataView, key) => {
                if ((key & 0xff) == 0xdd) {
                    let weight = ((key & 0xff00) + valueDataView.getUint8(0)) / 10.0;
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