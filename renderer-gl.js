var render = window.render = {
    layer: 0,
    subLayer: 0,
    shaders: {},
};

var canvas = window.canvas = render.canvas = document.getElementById("gl");
canvas.width = 1280;
canvas.height = 720;

canvas.addEventListener("mousemove", function mousemove(x) {
    render.cx = x.clientX;
    render.cy = x.clientY;
});

var ctx2d = document.createElement("canvas").getContext("2d");
var gl = render.gl = canvas.getContext("webgl", { alpha: false });

gl.enable(gl.BLEND);
gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

render.Initialize = function Initialize() {
    return glFonts.Load( gl );
}

render.InitShader = function InitShader(vsSource, fsSource) {
    var gl = this.gl;

    var vertexShader = this.LoadShader(gl.VERTEX_SHADER, vsSource);
    var fragmentShader = this.LoadShader(gl.FRAGMENT_SHADER, fsSource);

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);


    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

render.LoadShader = function LoadShader(type, source) {
    var gl = this.gl;

    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

var basic = render.shaders["basic"] = render.InitShader(
    `
        attribute vec2 position;
        uniform vec2 scale;

        void main() {
            gl_Position = vec4((position * scale - vec2(1.0, 1.0)) * vec2(1, -1), 1.0, 1.0);
        }
    `,
    `
        precision mediump float;
        uniform vec4 color;
        void main() {
            gl_FragColor = color;
        }
    `
);

var basicTexture = render.shaders["basicTexture"] = render.InitShader(
    `
        attribute vec2 position;
        attribute vec2 vTexCoord;
        attribute vec4 vColor;
        uniform vec2 scale;

        varying vec2 fTexCoord;
        varying vec4 fColor;

        void main() {
            fTexCoord = vTexCoord;
            fColor = vColor;
            gl_Position = vec4((position * scale - vec2(1.0, 1.0)) * vec2(1, -1), 1.0, 1.0);
        }
    `,
    `
        precision mediump float;
        varying vec2 fTexCoord;
        varying vec4 fColor;
        uniform sampler2D texSampler;
        void main() {
            gl_FragColor = texture2D(texSampler, fTexCoord);
            gl_FragColor.rgb *= gl_FragColor.a;
            gl_FragColor *= fColor;
        }
    `
);

render.basic = {
    program: basic,
    attribLocations: {
        position: gl.getAttribLocation(basic, "position"),
    },
    uniformLocations: {
        scale: gl.getUniformLocation(basic, "scale"),
        color: gl.getUniformLocation(basic, "color")
    },
};

render.basicTexture = {
    program: basicTexture,
    attribLocations: {
        position: gl.getAttribLocation(basicTexture, "position"),
        vTexCoord: gl.getAttribLocation(basicTexture, "vTexCoord"),
        vColor: gl.getAttribLocation(basicTexture, "vColor"),
    },
    uniformLocations: {
        scale: gl.getUniformLocation(basicTexture, "scale"),
        texSampler: gl.getUniformLocation(basicTexture, "texSampler"),
    },
};

/*
// we can rescale easily like this:
canvas.style.width  = '128px';
canvas.style.height = '72px';
*/

render.images = [];
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
    return b.layer - a.layer;
}

render.RunThread = function RunThread() {
    if (!this.luaThread) {
        this.luaThread = lua.lua_newthread(L);
        lua.luaL_loadstring(this.luaThread, 'repeat runCallback("OnFrame") until coroutine.yield()');
    }
    var res;
    res = lua.lua_resume(this.luaThread, 0, 0);

    if (res === 2) // LUA_ERRRUN
        throw new Error("render thread did not render successfully: " + lua.lua_tostring(L, -1));
    else if (res !== 1)
        throw new Error("render thread ended");

    if (lua.lua_type(this.luaThread, 1) === 4) // LUA_TSTRING
        throw new Error("unsupported render thread yield: " + lua.lua_tostring(this.luaThread, 1));
}

var rect = gl.createBuffer();
render.RealDrawRect = function RealDrawRect(x, y, w, h, col) {
    var gl = this.gl;
    var shaderInfo = this.basic;
    gl.bindBuffer(gl.ARRAY_BUFFER, rect);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            x, y,
            x + w, y,
            x, y + h,
            x + w, y + h
        ]),
        gl.STATIC_DRAW
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, rect);
    gl.vertexAttribPointer(
        shaderInfo.attribLocations.position,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(shaderInfo.attribLocations.position);

    gl.useProgram(shaderInfo.program);

    gl.uniform2fv(shaderInfo.uniformLocations.scale, [2 / canvas.width, 2 / canvas.height]);
    gl.uniform4fv(shaderInfo.uniformLocations.color, col);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // :/
    gl.disableVertexAttribArray(shaderInfo.attribLocations.position);
    gl.disableVertexAttribArray(shaderInfo.attribLocations.color);
}

var stupidPos = gl.createBuffer();
var stupidTexCoord = gl.createBuffer();
var stupidColor = gl.createBuffer();
render.RealDrawString = function RealDrawString(x, y, fontName, height, text, align) {
    var width = glFonts.GetTextWidth(fontName, height, text);

    switch (align)
    {
        case "CENTER":
            x -= width / 2;
            y -= height / 2;
            break;

        case "CENTER_X":
            x -= width / 2;
            break;

        case "RIGHT":
            x -= width;
            y -= height / 2;
            break;

        case "RIGHT_X":
            x -= width;
            break;

        case "LEFT":
            break;

        default:
            console.log("Unknown Alignment:", align);
            break;
    }

    var gl = this.gl;
    var shaderInfo = this.basicTexture;
    var res = glFonts.BuildBuffers(fontName, height, text, x, y);

    if ( res.Positions.length == 0 )
        return;

    gl.bindTexture(gl.TEXTURE_2D, res.Texture);

    gl.bindBuffer(gl.ARRAY_BUFFER, stupidPos);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        res.Positions,
        gl.STATIC_DRAW
    );
    gl.vertexAttribPointer(
        shaderInfo.attribLocations.position,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(shaderInfo.attribLocations.position);

    gl.bindBuffer(gl.ARRAY_BUFFER, stupidTexCoord);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        res.TexCoords,
        gl.STATIC_DRAW
    );
    gl.vertexAttribPointer(
        shaderInfo.attribLocations.vTexCoord,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(shaderInfo.attribLocations.vTexCoord);

    gl.bindBuffer(gl.ARRAY_BUFFER, stupidColor);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        res.Colors,
        gl.STATIC_DRAW
    );
    gl.vertexAttribPointer(
        shaderInfo.attribLocations.vColor,
        4,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(shaderInfo.attribLocations.vColor);

    gl.useProgram(shaderInfo.program);

    gl.uniform2fv(shaderInfo.uniformLocations.scale, [2 / canvas.width, 2 / canvas.height]);
    gl.uniform1i(shaderInfo.uniformLocations.texSampler, 0);

    gl.drawArrays(gl.TRIANGLES, 0, res.Positions.length / 2);

    // :/
    gl.disableVertexAttribArray(shaderInfo.attribLocations.position);
    gl.disableVertexAttribArray(shaderInfo.attribLocations.vTexCoord);
}

render.AdvanceFrame = function AdvanceFrame() {
    var gl = this.gl
    this.renderCount = 0;
    this.queue = [];

    this.layer = 0;
    this.subLayer = 0;

    // call lua OnFrame
    // render from queue
    // TODO: not string
    this.RunThread(L);
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var queue = this.queue;
    this.last_queue = queue.slice()
    queue.sort(sorter)

    var offset_x = 0, offset_y = 0;

    var last_color = [1, 1, 1, 1];

    for (; queue.length;) {
        var obj = queue.pop();

        if (obj.color !== undefined && last_color !== obj.color) {
            last_color = obj.color;
        }

        switch (obj.type) {
            case "DrawRect":
                this.RealDrawRect(obj.left + offset_x, obj.top + offset_y, obj.width, obj.height, last_color);
                break;

            case "DrawString":
                this.RealDrawString(obj.left + offset_x, obj.top + offset_y, obj.font, obj.height, obj.text, obj.align);
                break;

            case "SetViewport":
                offset_x = 0;
                offset_y = 0;

                if (obj.x !== null) {
                    offset_x = obj.x;
                    offset_y = obj.y;
                }
                break;

            /*case "SetDrawColor":
                break;
            case "DrawImage":
                var imgEntry = this.images[obj.image];

                if (!imgEntry || imgEntry.error) {
                    var oldFillStyle = ctx.fillStyle;
                    ctx.fillStyle ='pink';
                    ctx.fillRect(obj.left + offset_x, obj.top + offset_y, obj.width, obj.height);
                    ctx.fillStyle = oldFillStyle;
                    break;
                }

                var img = imgEntry.image;

                if ( obj.tcLeft && obj.tcTop && obj.tcRight && obj.tcBottom )
                {
                    var sx = img.width * obj.tcLeft;
                    var sy = img.height * obj.tcTop;
                    var sw = (img.width * obj.tcRight) - sx;
                    var sh = (img.height * obj.tcBottom) - sy;

                    // background hack - it's wrong
                    if ( sw > img.width || sh > img.height )
                    {
                        ctx.drawImage(img, 0, 0, img.width, img.height, obj.left + offset_x, obj.top + offset_y, obj.width, obj.height);
                    }
                    else
                    {
                        ctx.drawImage(img, sx, sy, sw, sh, obj.left + offset_x, obj.top + offset_y, obj.width, obj.height);
                    }
                }
                else
                {
                    ctx.drawImage(img, obj.left + offset_x, obj.top + offset_y, obj.width, obj.height);
                }

                break;
            */
            case "DrawImageQuad":

                var imgEntry = this.images[obj.image];

                if (!imgEntry || !imgEntry.loaded || imgEntry.error) {
                    break;
                }

                var shaderInfo = this.basicTexture;

                gl.bindTexture(gl.TEXTURE_2D, imgEntry.texture);
            
                gl.bindBuffer(gl.ARRAY_BUFFER, stupidPos);
                gl.bufferData(
                    gl.ARRAY_BUFFER,
                    new Float32Array([
                        obj.x1, obj.y1,
                        obj.x2, obj.y2,
                        obj.x3, obj.y3,
                        obj.x4, obj.y4
                    ]),
                    gl.STATIC_DRAW
                );
                gl.vertexAttribPointer(
                    shaderInfo.attribLocations.position,
                    2,
                    gl.FLOAT,
                    false,
                    0,
                    0
                );
                gl.enableVertexAttribArray(shaderInfo.attribLocations.position);
            
                gl.bindBuffer(gl.ARRAY_BUFFER, stupidTexCoord);
                gl.bufferData(
                    gl.ARRAY_BUFFER,
                    new Float32Array([
                        obj.s1, obj.t1,
                        obj.s2, obj.t2,
                        obj.s3, obj.t3,
                        obj.s4, obj.t4
                    ]),
                    gl.STATIC_DRAW
                );
                gl.vertexAttribPointer(
                    shaderInfo.attribLocations.vTexCoord,
                    2,
                    gl.FLOAT,
                    false,
                    0,
                    0
                );
                gl.enableVertexAttribArray(shaderInfo.attribLocations.vTexCoord);
            
                gl.bindBuffer(gl.ARRAY_BUFFER, stupidColor);
                gl.bufferData(
                    gl.ARRAY_BUFFER,
                    new Float32Array([
                        1, 1, 1, 1,
                        1, 1, 1, 1,
                        1, 1, 1, 1,
                        1, 1, 1, 1
                    ]),
                    gl.STATIC_DRAW
                );
                gl.vertexAttribPointer(
                    shaderInfo.attribLocations.vColor,
                    4,
                    gl.FLOAT,
                    false,
                    0,
                    0
                );
                gl.enableVertexAttribArray(shaderInfo.attribLocations.vColor);
            
                gl.useProgram(shaderInfo.program);
            
                gl.uniform2fv(shaderInfo.uniformLocations.scale, [2 / canvas.width, 2 / canvas.height]);
                gl.uniform1i(shaderInfo.uniformLocations.texSampler, 0);
            
                gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
            
                // :/
                gl.disableVertexAttribArray(shaderInfo.attribLocations.position);
                gl.disableVertexAttribArray(shaderInfo.attribLocations.vTexCoord);

                break;

            /*

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

                ctx.font = "" + (obj.height - 2) + "px " + (obj.font == "FIXED" ? "monospace" : "sans-serif");
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

*/
            default:
                //console.log("not implemented: " + obj.type);
        }
    }
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
    if (typeof r == "string") {
        var col = render.ColorFromString(r);
        r = col.r, g = col.g, b = col.b, a = col.a;
    }
    this.color = [r, g, b, a];
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

render.DrawImageQuad = function DrawImageQuad(imgHandle, x1, y1, x2, y2, x3, y3, x4, y4, s1, t1, s2, t2, s3, t3, s4, t4) {
    this.Insert({
        image: imgHandle,
        x1: x1, y1: y1,
        x2: x2, y2: y2,
        x3: x3, y3: y3,
        x4: x4, y4: y4,
        s1: s1, t1: t1,
        s2: s2, t2: t2,
        s3: s3, t3: t3,
        s4: s4, t4: t4,
        type: "DrawImageQuad"
    });
}

render.DrawString = function DrawString(left, top, align, height, font, text) {
    this.Insert({
        left: left,
        top: top,
        align: align,
        height: height,
        font: font,
        text: text,
        type: "DrawString"
    });
}

render.DrawStringWidth = function DrawStringWidth(height, font, text) {
    return glFonts.GetTextWidth(font, height, text);
}

render.DrawStringCursorIndex = function DrawStringCursorIndex() {
    this.Insert({
        type: "DrawStringCursorIndex"
    });
}

render.LoadImage = function LoadImage(name) {
    var obj = {
        width: 0,
        height: 0,
        loaded: false,
        error: false,
        image: new Image,
    };
    var img = obj.image;

    obj.texture = gl.createTexture();

    img.crossOrigin = "anonymous";

    img.onload = () => {
        console.log( "ONLOAD!", name );
        gl.bindTexture(gl.TEXTURE_2D, obj.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

        // Might not be power-of-2. We don't care for now, but this might hurt us
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        obj.width = img.width;
        obj.height = img.height;

        obj.loaded = true;
    };

    img.onerror = () => {
        gl.bindTexture(gl.TEXTURE_2D, obj.texture);

        var pinkRGBA = new Uint8Array([255, 0, 220, 255]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pinkRGBA);

        obj.width = 1;
        obj.height = 1;
        
        obj.loaded = true;
        obj.error = true;
    };

    obj.image.src = `http://144.202.109.121:9000/?url=${localStorage[name]}`;

    return this.images.push(obj) - 1;
}

render.IsImageLoaded = function IsImageLoaded(idx) {
    return this.images[idx].loaded;
}

render.ImageWidth = function ImageWidth(idx) {
    return this.images[idx].width;
}

render.ImageHeight = function ImageHeight(idx) {
    return this.images[idx].height;
}

render.fileRequests = []

var up_dir_hack = /[^\/]+\/\.\.\//g
var newline_replace = /^#[^\n]+/;

render.LoadFile = function LoadFile(name) {
    var obj = {
        loaded: false,
        data: null,
    }

    fetch(name.replace(up_dir_hack, "")).then( res => {
        res.text().then( data => {
            obj.loaded = true;
            obj.data = data.replace(newline_replace, "");
        } );
    } );

    return this.fileRequests.push(obj) - 1;
}

render.IsFileLoaded = function IsFileLoaded(idx) {
    return this.fileRequests[idx].loaded;
}

render.FileData = function FileData(idx) {
    return this.fileRequests[idx].data;
}
