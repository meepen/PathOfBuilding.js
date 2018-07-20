var canvas = window.canvas = document.getElementById("render")
canvas.width = 1280;
canvas.height = 720;

var ctx = canvas.getContext("2d");
ctx.save();

/*
// we can rescale easily like this:
canvas.style.width  = '128px';
canvas.style.height = '72px';
*/

var render = window.render = {
    layer: 0,
    subLayer: 0
};
var images = render.images = {};
render.queue = [];

render.Insert = function Insert(obj) {
    obj.layer = this.layer;
    obj.subLayer = this.subLayer;
    obj.count = ++this.renderCount;
    render.queue.push(obj);
}

function sorter(a, b) {
    if (a.layer == b.layer) {
        if (a.subLayer == b.subLayer) {
            return b.count - a.count;
        }
        return b.subLayer - a.subLayer;
    }
    return a.layer - b.layer;
}

render.AdvanceFrame = function AdvanceFrame() {
    this.renderCount = 0;
    this.queue = [];

    // call lua OnFrame
    // render from queue
    // TODO: not string
    RunMainThread(L, 'runCallback("OnFrame")');

    var queue = this.queue;
    this.last_queue = queue.slice()
    queue.sort(sorter)

    var clipping_enabled = false;
    var offset_x = 0, offset_y = 0;

    for (; queue.length;) {
        var obj = queue.pop();

        switch (obj.type) {
            case "DrawRect":
                ctx.fillRect(obj.left + offset_x, obj.top + offset_y, obj.width, obj.height);
                break;
            case "SetDrawColor":
                ctx.fillStyle = "rgba(" + obj.r + "," + obj.b + "," + obj.b + "," + obj.a + ")";
                break;
            case "DrawImage":
                var img = this.images[obj.image];
                if (!img) {
                    console.log("tried to draw unloaded image: " + obj.image);
                    break;
                }

                ctx.drawImage(img, obj.left + offset_x, obj.top + offset_y, obj.width, obj.height);

                break;

            case "SetViewport":
                var textBaseline = ctx.textBaseline;
                var fillStyle = ctx.fillStyle;
                var textAlign = ctx.textAlign;
                var font = ctx.font;
                offset_x = 0;
                offset_y = 0;
                ctx.restore();
                ctx.save();
                if (obj.x !== undefined) {
                    ctx.beginPath();
                    ctx.rect(obj.x, obj.y, obj.width, obj.height);
                    ctx.clip();

                    offset_x = obj.x;
                    offset_y = obj.y;

                    ctx.textBaseline = textBaseline;
                    ctx.fillStyle = fillStyle;
                    ctx.textAlign = textAlign;
                    ctx.font = font;
                }
                break;

            case "DrawString":
                // TODO: separate _x crap
                if ( obj.align == "LEFT" || obj.align == "LEFT_X" )
                    ctx.textAlign = "left";
                else if ( obj.align == "RIGHT" || obj.align == "RIGHT_X" )
                    ctx.textAlign = "right";
                else if ( obj.align == "CENTER" || obj.align == "CENTER_X" )
                    ctx.textAlign = "center";

                ctx.font = "" + ( obj.height - 2 ) + "px Arial";
                ctx.textBaseline = "top";
                var originalStyle = ctx.fillStyle;

                var arr = this.StringToFormattedArray(obj.text);
                var text_offset = 0;
                console.log(obj.text);
                for (var i = 0; i < arr.length; i++) {
                    var part = arr[i];
                    console.log(part);
                    if (typeof part == "string") {
                        ctx.fillText(part, obj.left + text_offset + offset_x, obj.top + offset_y);
                        text_offset += ctx.measureText(part).width;
                    }
                    else {
                        ctx.fillStyle = "rgba(" + part.r + "," + part.b + "," + part.b + "," + part.a + ")";
                    }

                }

                ctx.fillStyle = originalStyle;
                break;

            default:
                console.log("not implemented: " + obj.type);
        }

    }
}

var annoying_shit = [
    { r: 0.0 * 255, g: 0.0 * 255, b: 0.0 * 255, a: 1.0 },
    { r: 1.0 * 255, g: 0.0 * 255, b: 0.0 * 255, a: 1.0 },
    { r: 0.0 * 255, g: 1.0 * 255, b: 0.0 * 255, a: 1.0 },
    { r: 0.0 * 255, g: 0.0 * 255, b: 1.0 * 255, a: 1.0 },
    { r: 1.0 * 255, g: 1.0 * 255, b: 0.0 * 255, a: 1.0 },
    { r: 1.0 * 255, g: 0.0 * 255, b: 1.0 * 255, a: 1.0 },
    { r: 0.0 * 255, g: 1.0 * 255, b: 1.0 * 255, a: 1.0 },
    { r: 1.0 * 255, g: 1.0 * 255, b: 1.0 * 255, a: 1.0 },
    { r: 0.69999999 * 255, g: 0.69999999 * 255, b: 0.69999999 * 255, a: 1.0 },
    { r: 0.40000001 * 255, g: 0.40000001 * 255, b: 0.40000001 * 255, a: 1.0 },
]

render.ColorFromString = function ColorFromString(r, i) {
    i = i || 0;
    var g, b, a;
    if (r[0 + i] != '^') {
        return;
    }
    var len
    if (r[1 + i] == 'x') {
        b = parseInt(r.slice(6 + i, 8 + i), 16);
        g = parseInt(r.slice(4 + i, 6 + i), 16);
        r = parseInt(r.slice(2 + i, 4 + i), 16);
        a = 1;
        len = 8;
    }
    else {
        var obj = annoying_shit[parseInt(r.slice(1 + i, 2 + i))];
        obj.len = 2;
        return obj;
    }
    if (!a)
        a = 1;
    return {
        r: r,
        g: g,
        b: b,
        a: a,
        len: len
    }
}

render.StringToFormattedArray = function StringToFormattedArray(str) {
    var ret = [];

    var last_find = 0;

    for (var i = 0; i < str.length; i++) {
        var col = this.ColorFromString(str, i);
        if (col) {
            if (last_find != i) {
                ret.push(str.slice(last_find, i));
            }
            ret.push(col);
            last_find = (i += col.len);
        }
    }

    if (i != last_find) {
        ret.push(str.slice(last_find, i));
    }

    return ret;
}

render.SetDrawLayer = function(layer, subLayer) {
    this.layer = layer;
    this.subLayer = subLayer;
}

render.SetViewport = function SetViewport(x, y, width, height) {
    this.Insert({
        x: x,
        y: y,
        width: width,
        height: height,
        type: "SetViewport"
    });
}

render.SetDrawColor = function SetDrawColor(r, g, b, a) {
    if (typeof r === "string") {
        var col = render.ColorFromString(r);
        if (!r) {
            console.log("no color from string: " + r);
            return;
        }
        r = col.r;
        g = col.g;
        b = col.b;
        a = col.a;
    }
    else {
        r *= 255;
        g *= 255;
        b *= 255;
    }

    if (a === undefined)
        a = 1;

    this.Insert({
        r: r,
        g: g,
        b: b,
        a: a,
        type: "SetDrawColor"
    });
}

render.DrawImage = function DrawImage(imgHandle, left, top, width, height, tcLeft, tcTop, tcRight, tcBottom) {
    if (imgHandle) {
        this.Insert({
            image: imgHandle,
            left: left,
            top: top,
            width: width,
            height: height,
            type: "DrawImage"
        });
    }
    else {
        this.Insert({
            left: left,
            top: top,
            width: width,
            height: height,
            type: "DrawRect"
        });
    }
}

render.DrawImageQuad = function DrawImageQuad(imageHandle, x1, y1, x2, y2, x3, y3, x4, y4, s1, t1, s2, t2, s3, t3, s4, t4) {
    this.Insert({
        type: "DrawImageQuad"
    });
}
render.DrawString = function DrawString(left, top, align, height, font, text) {
    this.Insert({
        left: left,
        top: top,
        align: align,
        height: height,
        text: text,
        type: "DrawString"
    });
}
render.DrawStringWidth = function DrawStringWidth() {
    this.Insert({
        type: "DrawStringWidth"
    });
}
render.DrawStringCursorIndex = function DrawStringCursorIndex() {
    this.Insert({
        type: "DrawStringCursorIndex"
    });
}


lua_callbacks["LoadImage"] = function(L) {
    var Callback = function Callback(L, img) {
        lua.lua_pushinteger(L, img.width);
        lua.lua_pushinteger(L, img.height);
        ContinueThread(L, 2);
    }

    var name = JavascriptString(lua.lua_tostring(L, 2));
    var img = images[name];

    if (img) {
        Callback(L, img);
        return;
    }

    var url = localStorage[name];
    if (!url) {
        lua.lua_pushinteger(L, 8);
        lua.lua_pushinteger(L, 8);
        ContinueThread(L, 2);
        console.log("no url for " + name);
        return;
    }

    img = document.createElement("img");
    img.onload = function onload() {
        Callback(L, this);
    }
    img.src = url;

    images[name] = img;
}