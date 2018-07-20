var render = window.render = {
    layer: 0,
    subLayer: 0
};

var canvas = window.canvas = document.getElementById("render")
canvas.width = 1280;
canvas.height = 720;

canvas.addEventListener("mousemove", function mousemove(x) {
    render.cx = x.clientX;
    render.cy = x.clientY;
});


var ctx = canvas.getContext("2d");
ctx.save();

/*
// we can rescale easily like this:
canvas.style.width  = '128px';
canvas.style.height = '72px';
*/

var images = render.images = {};
render.queue = [];

render.Insert = function Insert(obj) {
    obj.layer = this.layer;
    obj.subLayer = this.subLayer;
    obj.count = ++this.renderCount;
    render.queue.push(obj);
}

function not_implemented(L) {
    ContinueThread(L);
}

function wrap() {
    var args = arguments;
    return function(L) {
        var r = [];
        for (let i = 0; i < args.length; i++) {
            switch (args[i]) {
                case "string":
                    if (lua.lua_type(L, i + 2) == 4)
                        r.push(lua.lua_tostring(L, i + 2));
                    else
                        r.push(null);
                    break;
                case "number":
                    if (lua.lua_type(L, i + 2) == 3)
                        r.push(lua.lua_tonumber(L, i + 2));
                    else
                        r.push(null);
                    break;
                default:
                    break;
            }
        }
        render[lua.lua_tostring(L, 1)].apply(render, r);
        ContinueThread(L)
    }
}


function sorter(a, b) {
    if (a.layer == b.layer) {
        if (a.subLayer == b.subLayer) {
            return b.count - a.count;
        }
        return b.subLayer - a.subLayer;
    }
    return b.layer - a.layer;
}

render.AdvanceFrame = function AdvanceFrame() {
    return new Promise(res => {
        this.renderCount = 0;
        this.queue = [];

        this.layer = 0;
        this.subLayer = 0;

        // call lua OnFrame
        // render from queue
        // TODO: not string
        RunMainThread(L, 'runCallback("OnFrame")').then(() => {
            var queue = this.queue;
            this.last_queue = queue.slice()
            queue.sort(sorter)

            var offset_x = 0, offset_y = 0;

            var last_color = -1;

            for (; queue.length;) {
                var obj = queue.pop();

                if (obj.color !== undefined && last_color !== obj.color) {
                    last_color = obj.color;
                    ctx.fillStyle = "rgba(" + (obj.color >> 24 & 255) + "," + (obj.color >> 16 & 255 )+ "," + (obj.color >> 8 & 255) + "," + ((obj.color & 255) / 255) + ")"
                }

                switch (obj.type) {
                    case "DrawRect":
                        ctx.fillRect(obj.left + offset_x, obj.top + offset_y, obj.width, obj.height);
                        break;
                    case "SetDrawColor":
                        break;
                    case "DrawImage":
                        var img = this.images[obj.image];
                        if (!img) {
                            var oldFillStyle = ctx.fillStyle;
                            ctx.fillStyle ='pink';
                            ctx.fillRect(obj.left + offset_x, obj.top + offset_y, obj.width, obj.height);
                            ctx.fillStyle = oldFillStyle;
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
                        if (obj.x !== null) {
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
                        
                        ctx.fillStyle = "rgba(255,255,255,1)";
                        for (var i = 0; i < arr.length; i++) {
                            var part = arr[i];
                            
                            if (typeof part == "string") {
                                ctx.fillText(part, obj.left + text_offset + offset_x, obj.top + offset_y);
                                text_offset += ctx.measureText(part).width;
                            }
                            else {
                                ctx.fillStyle = "rgba(" + (part.r * 255) + "," + (part.g * 255) + "," + (part.b * 255) + "," + (part.a) + ")";
                            }
                        }

                        ctx.fillStyle = originalStyle;
                        break;

                    default:
                        //console.log("not implemented: " + obj.type);
                }

            }

            res();
        });
    });
}

var annoying_shit = [
    { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
    { r: 1.0, g: 0.0, b: 0.0, a: 1.0 },
    { r: 0.0, g: 1.0, b: 0.0, a: 1.0 },
    { r: 0.0, g: 0.0, b: 1.0, a: 1.0 },
    { r: 1.0, g: 1.0, b: 0.0, a: 1.0 },
    { r: 1.0, g: 0.0, b: 1.0, a: 1.0 },
    { r: 0.0, g: 1.0, b: 1.0, a: 1.0 },
    { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
    { r: 0.69999999, g: 0.69999999, b: 0.69999999, a: 1.0 },
    { r: 0.40000001, g: 0.40000001, b: 0.40000001, a: 1.0 },
]

render.ColorFromString = function ColorFromString(r, i) {
    i = i || 0;
    var g, b, a = 1;
    if (r[0 + i] != '^') {
        return;
    }
    var len
    if (r[1 + i] == 'x') {
        b = parseInt(r.slice(6 + i, 8 + i), 16) / 255;
        g = parseInt(r.slice(4 + i, 6 + i), 16) / 255;
        r = parseInt(r.slice(2 + i, 4 + i), 16) / 255;
        len = 8;
    }
    else {
        var obj = annoying_shit[parseInt(r.slice(1 + i, 2 + i))];
        obj.len = 2;
        return obj;
    }

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
    if (layer !== null)
        this.layer = layer;
    if (subLayer !== null)
        this.subLayer = subLayer;
    else
        this.subLayer = 0;
}
lua_callbacks["SetDrawLayer"] = wrap("number", "number");
render.SetViewport = function SetViewport(x, y, width, height) {
    this.Insert({
        x: x,
        y: y,
        width: width,
        height: height,
        type: "SetViewport"
    });
}
lua_callbacks["SetViewport"] = wrap("number", "number", "number", "number");

render.SetDrawColor = function SetDrawColor(r, g, b, a) {
    if (typeof r == "string") {
        var col = render.ColorFromString(r);
        r = col.r, g = col.g, b = col.b, a = col.a;
    }
    this.color = (r * 255) << 24 | (g * 255) << 16 | (b * 255) << 8 | (a * 255);
}

render.DrawRect = function DrawRect(left, top, width, height) {
    this.Insert({
        left: left,
        top: top,
        width: width,
        height: height,
        color: this.color,
        type: "DrawRect"
    });
}

render.DrawImage = function DrawImage(imgHandle, left, top, width, height, tcLeft, tcTop, tcRight, tcBottom) {
    this.Insert({
        image: imgHandle,
        left: left,
        top: top,
        width: width,
        height: height,
        tcLeft: tcLeft, 
        tcTop: tcTop,
        tcRight: tcRight,
        tcBottom: tcBottom,
        color: this.color,
        type: "DrawImage"
    });
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
        lua.lua_pushnumber(L, img.width);
        lua.lua_pushnumber(L, img.height);
        ContinueThread(L, 2);
    }

    var name = lua.lua_tostring(L, 2);
    var img = images[name];

    if (img) {
        Callback(L, img);
        return;
    }

    var url = localStorage[name];
    if (!url) {
        lua.lua_pushnumber(L, 8);
        lua.lua_pushnumber(L, 8);
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