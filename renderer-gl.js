var render = window.render = {
    layer: 0,
    subLayer: 0,
    shaders: {},
    events: [],
    viewport: {
        x: 0,
        y: 0,
        width: 1280,
        height: 720
    }
};

var canvas = window.canvas = render.canvas = document.getElementById("gl");
canvas.width = render.viewport.width;
canvas.height = render.viewport.height;

canvas.addEventListener("mousemove", function mousemove(x) {
    render.cx = x.clientX;
    render.cy = x.clientY;
});

var keyStateTranslations = {
    "Control": "CTRL",
    "ArrowRight": "RIGHT",
    "ArrowUp": "UP",
    "ArrowLeft": "LEFT",
    "ArrowRight": "RIGHT",
    "Shift": "SHIFT",
    "Alt": "ALT"
}
var keyTranslations = {};
render.keyStates = {};

canvas.addEventListener("keydown", function keydown(x) {
    if (keyStateTranslations[x.key]) {
        render.keyStates[keyStateTranslations[x.key]] = true;
    }
    else if (keyTranslations[x.key]) {

    }
});

canvas.addEventListener("keyup", function keyup(x) {
    if (keyStateTranslations[x.key]) {
        render.keyStates[keyStateTranslations[x.key]] = false;
    }
    else if (keyTranslations[x.key]) {
        
    }
});

window.addEventListener("wheel", function onwheel(x) {
    if (x.deltaY === 0)
        return;
    
    // Unfortunately, wheel event has deltaY at a multiplier dependent on browser, so we can't scroll properly
    render.events.push({
        type: "OnKeyUp",
        arg: "WHEEL" + (x.deltaY > 0 ? "DOWN" : "UP")
    });
});

render.IsKeyDown = function IsKeyDown(key) {
    return !!render.keyStates[key];
}



var ctx2d = document.createElement("canvas").getContext("2d");
var gl = render.gl = canvas.getContext("webgl2", { alpha: false });
if (!gl) {
    alert("This browser doesn't support WebGL 2!");
    throw new Error("doesn't support webgl2");
}

var stupidPos = gl.createBuffer();
var stupidTexCoord = gl.createBuffer();
var stupidColor = gl.createBuffer();

gl.enable(gl.BLEND);
gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

render.Initialize = function Initialize() {
    var gl = this.gl;

    {
        this.WhiteTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.WhiteTex);

        var whiteRGBA = new Uint8Array([255, 255, 255, 255]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, whiteRGBA);
    }

    return glFonts.Load( gl );
}

render.InitShader = function InitShader(vsSource, fsSource, binds) {
    var gl = this.gl;

    var vertexShader = this.LoadShader(gl.VERTEX_SHADER, vsSource);
    var fragmentShader = this.LoadShader(gl.FRAGMENT_SHADER, fsSource);

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);


    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        throw new Error("Unable to initialize the shader program: " + gl.getProgramInfoLog(shaderProgram));
    }

    return shaderProgram;
}

render.LoadShader = function LoadShader(type, source) {
    var gl = this.gl;

    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        var log = gl.getShaderInfoLog(shader)
        gl.deleteShader(shader);
        throw new Error("An error occurred compiling the shaders: " + log);
    }

    return shader;
}

var basicTexture = render.shaders["basicTexture"] = render.InitShader(
    `#version 300 es
        in vec2 position;
        in vec2 vTexCoord;
        in vec4 vColor;
        uniform mat3 projection;

        out vec2 fTexCoord;
        out vec4 fColor;

        void main() {
            fTexCoord = vTexCoord;
            fColor = vColor;
            gl_Position = vec4((projection * vec3(position, 1)).xy, 0, 1);
        }
    `,
    `#version 300 es
        precision mediump float;

        in vec2 fTexCoord;
        in vec4 fColor;

        uniform sampler2D texSampler;

        out vec4 _FragColor;

        void main() {
            _FragColor = texture(texSampler, fTexCoord);
            _FragColor.rgb *= _FragColor.a;
            _FragColor *= fColor;
        }
    `
);

render.basicTexture = {
    program: basicTexture,
    attribLocations: {
        vTexCoord: gl.getAttribLocation(basicTexture, "vTexCoord"),
        position: gl.getAttribLocation(basicTexture, "position"),
        vColor: gl.getAttribLocation(basicTexture, "vColor")
    },
    uniformLocations: {
        texSampler: gl.getUniformLocation(basicTexture, "texSampler"),
        projection: gl.getUniformLocation(basicTexture, "projection")
    },
};

/*
// we can rescale easily like this:
canvas.style.width  = '128px';
canvas.style.height = '72px';
*/

render.imageLookup = {};
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
        res = lua.luaL_loadstring(this.luaThread, `
            local events = ...
            while true do
                for i = 1, #events do
                    local event = events[i]
                    runCallback(event.type, event.arg)
                end
                runCallback("OnFrame")
                events = coroutine.yield()
            end
        `);

        if (res !== 0)
            throw new Error("error in compiling render thread: " + res);
    }

    lua.lua_createtable(this.luaThread, 0, 0);

    var event;
    var i = 1;
    while (event = render.events.pop()) {
        lua.lua_createtable(this.luaThread,  0, 0);
        for (var key in event) {
            lua.lua_pushstring(this.luaThread, event[key]);
            lua.lua_setfield(this.luaThread, -2, key);
        }
        lua.lua_rawseti(this.luaThread, -2, i++);
    }

    res = lua.lua_resume(this.luaThread, 0, 1);

    if (res === 2) // LUA_ERRRUN
        throw new Error("render thread did not render successfully: " + lua.lua_tostring(this.luaThread, -1));
    else if (res !== 1)
        throw new Error("render thread ended");

    if (lua.lua_type(this.luaThread, 1) === 4) // LUA_TSTRING
        throw new Error("unsupported render thread yield: " + lua.lua_tostring(this.luaThread, 1));
}

render.RealDrawRect = function RealDrawRect(x, y, w, h, col) {
    var gl = this.gl;
    var shaderInfo = this.basicTexture;

    gl.bindTexture(gl.TEXTURE_2D, this.WhiteTex);

    gl.bindBuffer(gl.ARRAY_BUFFER, stupidPos);
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
        Float32Array.from([
            0, 0,
            1, 0,
            0, 1,
            1, 1
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
            ...col,
            ...col,
            ...col,
            ...col
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

    var viewport = this.viewport;
    var mat = mat3.projection(mat3.create(), viewport.width, viewport.height);

    gl.uniformMatrix3fv(shaderInfo.uniformLocations.projection, false, mat);
    gl.uniform1i(shaderInfo.uniformLocations.texSampler, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // :/
    gl.disableVertexAttribArray(shaderInfo.attribLocations.position);
    gl.disableVertexAttribArray(shaderInfo.attribLocations.vTexCoord);
}

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

    if ( res.VertCount == 0 )
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

    var viewport = this.viewport;
    var mat = mat3.projection(mat3.create(), viewport.width, viewport.height);

    gl.uniformMatrix3fv(shaderInfo.uniformLocations.projection, false, mat);
    gl.uniform1i(shaderInfo.uniformLocations.texSampler, 0);

    gl.drawArrays(gl.TRIANGLES, 0, res.VertCount);

    // :/
    gl.disableVertexAttribArray(shaderInfo.attribLocations.position);
    gl.disableVertexAttribArray(shaderInfo.attribLocations.vTexCoord);
}

render.DrawTexture = function DrawTexture(tex, pos, texPos, color) {
    var shaderInfo = this.basicTexture;

    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.bindBuffer(gl.ARRAY_BUFFER, stupidPos);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        Float32Array.from([
            pos.x1, pos.y1,
            pos.x2, pos.y2,
            pos.x3, pos.y3,
            pos.x4, pos.y4
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
        Float32Array.from([
            texPos.s1, texPos.t1,
            texPos.s2, texPos.t2,
            texPos.s3, texPos.t3,
            texPos.s4, texPos.t4
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
            ...color,
            ...color,
            ...color,
            ...color
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

    var viewport = this.viewport;
    var mat = mat3.projection(mat3.create(), viewport.width, viewport.height);

    gl.uniformMatrix3fv(shaderInfo.uniformLocations.projection, false, mat);
    gl.uniform1i(shaderInfo.uniformLocations.texSampler, 0);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    gl.disableVertexAttribArray(shaderInfo.attribLocations.position);
    gl.disableVertexAttribArray(shaderInfo.attribLocations.vTexCoord);
}

render.RenderItem = function RenderItem(obj) {

}

render.AdvanceFrame = function AdvanceFrame() {
    var gl = this.gl
    this.renderCount = 0;
    this.queue = [];

    this.layer = 0;
    this.subLayer = 0;

    // call into lua
    this.RunThread(L);
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var queue = this.queue;
    this.last_queue = queue.slice()
    queue.sort(sorter)

    var viewport = this.viewport;

    for (; queue.length;) {
        var obj = queue.pop();

        switch (obj.type) {
            case "DrawRect":
                this.RealDrawRect(obj.left, obj.top, obj.width, obj.height, obj.color);
                break;

            case "DrawString":
                this.RealDrawString(obj.left, obj.top, obj.font, obj.height, obj.text, obj.align);
                break;

            case "SetViewport":
                if (obj.x !== null) {
                    viewport.x = obj.x;
                    viewport.y = canvas.height - obj.y - obj.height;
                    viewport.width = obj.width;
                    viewport.height = obj.height;
                }
                else {
                    viewport.x = 0;
                    viewport.y = 0;
                    viewport.width = canvas.width;
                    viewport.height = canvas.height;
                }
                gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
                break;

            case "DrawImage":
                var imgEntry = this.images[obj.image];

                if (!imgEntry || !imgEntry.loaded || imgEntry.error) {
                    break;
                }

                var u1 = obj.tcLeft,
                    v1 = obj.tcTop,
                    u2 = obj.tcRight,
                    v2 = obj.tcBottom;

                this.DrawTexture(imgEntry.texture, {
                    x1: obj.left,             y1: obj.top,
                    x2: obj.left,             y2: obj.top + obj.height,
                    x3: obj.left + obj.width, y3: obj.top + obj.height,
                    x4: obj.left + obj.width, y4: obj.top
                }, {
                    s1: u1, t1: v1,
                    s2: u1, t2: v2,
                    s3: u2, t3: v2,
                    s4: u2, t4: v1
                }, obj.color);

                break;

            case "DrawImageQuad":

                var imgEntry = this.images[obj.image];

                if (!imgEntry || !imgEntry.loaded || imgEntry.error) {
                    break;
                }

                this.DrawTexture(imgEntry.texture, {
                    x1: obj.x1, y1: obj.y1,
                    x2: obj.x2, y2: obj.y2,
                    x3: obj.x3, y3: obj.y3,
                    x4: obj.x4, y4: obj.y4
                }, {
                    s1: obj.s1, t1: obj.t1,
                    s2: obj.s2, t2: obj.t2,
                    s3: obj.s3, t3: obj.t3,
                    s4: obj.s4, t4: obj.t4
                }, obj.color);

                break;

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
        color: this.color,
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
    if (this.imageLookup.hasOwnProperty(name))
    {
        return this.imageLookup[name];
    }

    var obj = {
        width: 0,
        height: 0,
        loaded: false,
        error: false,
        image: new Image(),
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

    var idx = this.images.push(obj) - 1;
    this.imageLookup[name] = idx;
    return idx;
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
