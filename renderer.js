var canvas = window.canvas = document.getElementById("render")
canvas.width = 1280;
canvas.height = 720;

var ctx = canvas.getContext("2d");

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
    for (; queue.length;) {
        var obj = queue.pop();

        switch (obj.type) {
            case "DrawRect":
                ctx.fillRect(obj.left, obj.top, obj.width, obj.height);
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

                ctx.drawImage(img, obj.left, obj.top, obj.width, obj.height);

                break;
            default:
                console.log("not implemented: " + obj.type);
        }

    }
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
        type: "SetViewPort"
    });
}

render.SetDrawColor = function SetDrawColor(r, g, b, a) {
    if (typeof r === "string") {
        if (r[0] != '^') {
            console.log("not implemented: non caret color string");
            return;
        }
        if (r[1] == 'x') {
            b = parseInt(r.slice(-2), 16);
            g = parseInt(r.slice(-4, -2), 16);
            r = parseInt(r.slice(-6, -4), 16);
            a = 1;
        }
        if (r.length == 2) {
            r = g = b = parseInt(r.slice(-1).repeat(2), 16);
            a = 1;
        }
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
render.DrawString = function DrawString() {
    this.Insert({
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