var user_height = localStorage.getItem("height");
var rad_range = 1.7;
var start_rad = (2 - rad_range) / 2 + 0.5;
var weight_range = 100;
var weight_bais = 0;
var panel;
var last_height = 0;
var last_data = 0;
var i_gray = "#606060";
var i_green = "#75ed2f";
var i_yellow = "yellow";
var i_red = "#ff0000";
var bgc = RGBToHex(window.getComputedStyle(document.body, null).backgroundColor);
var bgc2 = "#4287d7";

function fill() {
    //btn pos setting
    let margin_width = parseInt(getComputedStyle(document.body, null).marginLeft);
    margin_width += parseInt(getComputedStyle(document.body, null).marginRight);
    let margin_height = parseInt(getComputedStyle(document.body, null).marginTop);
    margin_height += parseInt(getComputedStyle(document.body, null).marginBottom);
    //start scanning btn
    let btn = document.getElementById("start");
    btn.style.width = Math.floor((document.documentElement.clientWidth - margin_width) / 2) - 6 + "px";
    btn.style.height = Math.floor((document.documentElement.clientHeight - margin_height) / 12) + "px";
    btn.style.fontSize = Math.floor(document.body.clientWidth / 16) + "px";
    //setting btn
    btn = document.getElementById("setting");
    btn.style.width = Math.floor((document.documentElement.clientWidth - margin_width) / 2) - 6 + "px";
    btn.style.height = Math.floor((document.documentElement.clientHeight - margin_height) / 12) + "px";
    btn.style.fontSize = Math.floor(document.body.clientWidth / 16) + "px";
    //indicator canvas
    let c = document.getElementById("indicator");
    let length = Math.min(document.documentElement.clientWidth - margin_width, document.documentElement.clientHeight - margin_height);
    c.style.width = length + "px";
    c.style.height = length + "px";
    c.width = Math.floor(length * window.devicePixelRatio);
    c.height = Math.floor(length * window.devicePixelRatio);
    //graph canvas
    c = document.getElementById("graph");
    let width = document.documentElement.clientWidth - margin_width;
    let height = document.documentElement.clientHeight - c.offsetTop - parseInt(getComputedStyle(document.body, null).marginBottom);
    c.style.width = width - 4 + "px";
    c.style.height = height - 8 + "px";
    c.width = Math.floor(width * window.devicePixelRatio);
    c.height = Math.floor(height * window.devicePixelRatio);

    draw_indicator(0);
    show_graph();
}

function setting() {
    let win = document.getElementById("settingwin");
    if (getComputedStyle(win, null).visibility == "hidden") {
        let border = 10;
        win.style.top = border + "px";
        win.style.left = border + "px";
        border = document.documentElement.clientWidth - 2 * (border + parseInt(getComputedStyle(win).borderLeftWidth) + parseInt(getComputedStyle(win).paddingLeft));
        win.style.width = border + "px";
        //win.style.height = "auto";
        document.getElementById("height").value = parseInt(user_height * 100);
        win.style.visibility = "visible";
    } else {
        win.style.visibility = "hidden";
    }
}

function update() {
    user_height = parseInt(document.getElementById("height").value) / 100.0;
    localStorage.setItem("height", user_height);
    document.getElementById('settingwin').style.visibility = 'hidden';
    let d = new Date();
    draw_indicator(0);
    show_graph();
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
    let ctx = c.getContext("2d");
    let r = Math.min(c.width, c.height) / 2.1;
    clr_canvas(c);
    ctx.fillStyle = bgc;
    ctx.fillRect(0, 0, c.width, c.height);
    draw_ranges(c, user_height, r);
    draw_pointer(c, weight, user_height, r * 0.92);
}

function draw_range(canvas, r, start, end, color, width) {
    let ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(0, 0, r, start * Math.PI, end * Math.PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}

function draw_ranges(canvas, height, r) {
    let ctx = canvas.getContext("2d");
    if (panel === undefined || last_height != height) {
        let div = getdiv(height);
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.font = Math.floor(canvas.width / 25) + "px Arial";

        let txt = weight_bais;
        ctx.fillStyle = "black";
        ctx.rotate((0.5 + rad_range * 0 / weight_range + start_rad) * Math.PI);
        ctx.fillText(txt, -ctx.measureText(txt).width / 2, -canvas.height * 0.415);

        txt = div["underweight"].toFixed(2);
        ctx.fillStyle = i_gray;
        ctx.rotate(rad_range * (div["underweight"] - 0) / weight_range * Math.PI);
        ctx.fillText(txt, -ctx.measureText(txt).width / 2, -canvas.height * 0.415);

        txt = div["overweight"].toFixed(2);
        ctx.fillStyle = i_yellow;
        ctx.rotate(rad_range * (div["overweight"] - div["underweight"]) / weight_range * Math.PI);
        ctx.fillText(txt, -ctx.measureText(txt).width / 2, -canvas.height * 0.415);

        txt = div["obesity"].toFixed(2);
        ctx.fillStyle = i_red;
        ctx.rotate(rad_range * (div["obesity"] - div["overweight"]) / weight_range * Math.PI);
        ctx.fillText(txt, -ctx.measureText(txt).width / 2, -canvas.height * 0.415);

        txt = weight_bais + weight_range;
        ctx.fillStyle = i_red;
        ctx.rotate(rad_range * (weight_bais + weight_range - div["obesity"]) / weight_range * Math.PI);
        ctx.fillText(txt, -ctx.measureText(txt).width / 2, -canvas.height * 0.415);

        ctx.setTransform(1, 0, 0, 1, canvas.width / 2, canvas.height / 2);

        let bd = 0.0013;
        let line_width = 45;
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
    let line_width = 6;
    let bd = 1.004
    //draw num
    ctx.lineWidth = 2
    ctx.font = Math.floor(canvas.width / 12) + "px Arial";
    ctx.strokeStyle = "black";
    let txt = weight.toFixed(1) + "KG";
    let x = -ctx.measureText(txt).width / 2;
    let y = canvas.height / 2.5;
    ctx.strokeText(txt, x, y);
    ctx.fillStyle = get_bmi_color(weight, height);
    ctx.fillText(txt, x, y);


    x = r * Math.cos((rad_range * weight / weight_range + start_rad) * Math.PI);
    y = r * Math.sin((rad_range * weight / weight_range + start_rad) * Math.PI);

    //draw border
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, 2 * Math.PI);
    ctx.fillStyle = "black"
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(bd * x, bd * y);
    ctx.lineWidth = line_width + 2;
    ctx.strokeStyle = "black"
    ctx.stroke();
    //draw pointer
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, 2 * Math.PI);
    ctx.fillStyle = get_bmi_color(weight, height)
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(x, y);
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
    height = arguments.length == 1 ? user_height : height;
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
    let ctx = canvas.getContext("2d");
    ctx.clearRect(-canvas.width, -canvas.height, canvas.width, canvas.height);
}

function show_graph() {
    let c = document.getElementById("graph");
    clr_canvas(c);
    let data = JSON.parse(localStorage.getItem("data"));
    //get extremum and clean data in the same hour
    let dates = new Array();
    let weights = {};
    let max, min;
    let lastdate = new Date(0);
    for (let key in data) {
        key = parseInt(key);
        let date = new Date(key);
        let weight = parseFloat(data[key]);
        if (lastdate.toDateString() == date.toDateString()
            && weights[date.toDateString()] > weight) {
            dates[dates.length - 1] = key;
            weights[date.toDateString()] = weight;
            lastdate = date;
        }
        if (lastdate.toDateString() != date.toDateString()) {
            dates.push(key);
            weights[date.toDateString()] = weight;
            lastdate = date;
        }
    }
    dates = dates.sort((a, b) => a - b);
    for (let i = dates.length - 1; i >= 0; i--) {
        if (dates[dates.length - 1] - dates[i] >= 86400000 * 9) {
            dates.splice(i, 1);
        } else {
            max = max > data[dates[i]] ? max : data[dates[i]];
            min = min < data[dates[i]] ? min : data[dates[i]];
        }
    }
    //calculate position of weight
    let xs = new Array();
    let ys = new Array();
    let xperiod = dates[dates.length - 1] - dates[0];
    let yperiod = max - min;
    let dmin = dates[0];
    let wmin = min;
    let xbias = 100;
    let xratio = (c.width - xbias*2) / xperiod;
    let ybias = 100;
    let yratio = (c.height - ybias * 2) / yperiod;
    weights = [];
    for (let i = 0; i < dates.length; i++) {
        xs.push(xratio * (dates[i] - dmin) + xbias);
        ys.push(c.height - yratio * (data[dates[i]] - wmin) - ybias);
        weights.push(data[dates[i]]);
    }

    //draw background
    let ctx = c.getContext("2d");
    ctx.fillStyle = bgc;
    ctx.fillRect(0, 0, c.width, c.height);
    xbias = xbias - (dmin - new Date(new Date(dmin).toDateString()).getTime()) * xratio;
    for (let i = 0; i * xratio * 86400000 < c.width; i++) {
        ctx.fillStyle = ctx.fillStyle == bgc ? bgc2 : bgc;
        ctx.fillRect(i * xratio * 86400000 + xbias, 0, (i + 1) * xratio * 86400000 + xbias, c.height);
        let oldstyle = ctx.fillStyle;
        let date = new Date(dates[i]);
        let txt = dates[i] ? (date.getMonth() + 1) + "/" + date.getDate() : "";
        ctx.font = Math.floor(c.width / 35) + "px Arial";
        ctx.fillStyle = "#bf00ff";
        ctx.fillText(txt, (i + 0.5) * xratio * 86400000 + xbias - ctx.measureText(txt).width / 2, c.height - 10);
        ctx.fillStyle = oldstyle;
    }
    //draw graph
    plot_curve(c, 0, c.height - 8, xs, ys);
    plot_number(c, xs, ys, weights, get_bmi_color);
}

function plot_curve(canvas, x, y, xs, ys, color = "#00ffff", width = 6) {
    let ctx = canvas.getContext("2d");
    for (let i = 0; i < xs.length; i++) {
        let scale = 0.06;
        ctx.beginPath();
        if (i == 0) {
            continue;
        } else {
            ctx.moveTo(xs[i - 1], ys[i - 1]);
        }
        let xp2 = i - 2 < 0 ? x : xs[i - 2];
        let yp2 = i - 2 < 0 ? y : ys[i - 2];
        let xn1 = i == xs.length - 1 ? xs[i] : xs[i + 1];
        let yn1 = i == xs.length - 1 ? ys[i] : ys[i + 1];
        let cax = xs[i - 1] + (xs[i] - xp2) * scale;
        let cay = ys[i - 1] + (ys[i] - yp2) * scale;
        let cbx = xs[i] - (xn1 - xs[i - 1]) * scale;
        let cby = ys[i] - (yn1 - ys[i - 1]) * scale;
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.bezierCurveTo(cax, cay, cbx, cby, xs[i], ys[i]);
        ctx.stroke();
    }
}

function plot_number(canvas, xs, ys, value, color = "black", font = "default", ptsize = 6) {
    let ctx = canvas.getContext("2d");
    for (let i = 0; i < xs.length; i++) {
        let x = xs[i];
        let y = ys[i];
        ctx.beginPath();
        ctx.font = font == "default" ? Math.floor(canvas.width / 30) + "px Arial" : font;
        ctx.arc(xs[i], ys[i], ptsize, 0, 2 * Math.PI);
        ctx.fillStyle = isColor(color) ? color : color(value[i]);
        ctx.fill();
        ctx.fillText(value[i], xs[i] - ctx.measureText(value[i]).width / 2, ys[i] + canvas.width / 30 + 9);

    }
}

function isColor(strColor) {
    var s = new Option().style;
    s.color = strColor;
    return s.color == strColor;
}

function RGBToHex(rgb) {
    // Choose correct separator
    let sep = rgb.indexOf(",") > -1 ? "," : " ";
    // Turn "rgb(r,g,b)" into [r,g,b]
    rgb = rgb.substr(4).split(")")[0].split(sep);

    let r = (+rgb[0]).toString(16),
        g = (+rgb[1]).toString(16),
        b = (+rgb[2]).toString(16);

    if (r.length == 1)
        r = "0" + r;
    if (g.length == 1)
        g = "0" + g;
    if (b.length == 1)
        b = "0" + b;

    return "#" + r + g + b;
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
            if (scan.active) {
                log('Advertisement received.');
                log('  Device Name: ' + event.device.name);
                log('  RSSI: ' + event.rssi);
                event.manufacturerData.forEach((valueDataView, key) => {
                    let date = parseInt(new Date().getTime());
                    if ((key & 0xff) == 0xdd && date - last_data >= 500) {
                        let weight = ((key & 0xff00) + valueDataView.getUint8(0)) / 10.0;
                        move_pointer(weight);
                        let data = JSON.parse(localStorage.getItem("data"));
                        !data ? data = {} : data;
                        data[date.toString()] = weight.toString();
                        localStorage.setItem("data", JSON.stringify(data));
                        show_graph();
                        log("weight is " + weight);
                        if (weight > 0) {
                            last_data = date;
                            stopScan();
                        }
                    }
                });
                log("-------------------------");
            }
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

function show_warning() {
    let win = document.getElementById("warning");
    let border = 10;
    win.style.top = border + "px";
    win.style.left = border + "px";
    border = document.documentElement.clientWidth - 2 * (border + parseInt(getComputedStyle(win).borderLeftWidth) + parseInt(getComputedStyle(win).paddingLeft));
    win.style.width = border + "px";
    //win.style.height = win.style.width;
    win.style.visibility = "visible";
    document.getElementById("settingwin").style.visibility = "hidden";
}