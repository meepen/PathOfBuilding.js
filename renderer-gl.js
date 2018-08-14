var render = window.render = {
    color: 0,
    layer: -1,
    layerObj: null,
    subLayer: -1,
    subLayerObj: undefined,
    layers: [],
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
var stupidTexture = gl.createBuffer();

gl.enable(gl.BLEND);
gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

render.Initialize = function Initialize() {
    this.SetDrawLayer(0, 0);

    var gl = this.gl;

    {
        this.WhiteTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.WhiteTex);

        var whiteRGBA = new Uint8Array([255, 255, 255, 255]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, whiteRGBA);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.WhiteTex);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.WhiteTex);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.WhiteTex);

        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.WhiteTex);

        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, this.WhiteTex);

        gl.activeTexture(gl.TEXTURE5);
        gl.bindTexture(gl.TEXTURE_2D, this.WhiteTex);

        gl.activeTexture(gl.TEXTURE6);
        gl.bindTexture(gl.TEXTURE_2D, this.WhiteTex);

        gl.activeTexture(gl.TEXTURE7);
        gl.bindTexture(gl.TEXTURE_2D, this.WhiteTex);
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

var Shader = render.shaders["Shader"] = render.InitShader(
    `#version 300 es
        in vec2 vPosition;
        in vec2 vTexCoord;
        in vec4 vColor;
        in int vTexture;

        uniform mat3 uProjection;

        out vec2 fTexCoord;
        out vec4 fColor;
        flat out int fTexture;

        void main() {
            fTexCoord = vTexCoord;
            fColor = vColor;
            fTexture = vTexture;
            gl_Position = vec4((uProjection * vec3(vPosition, 1)).xy, 0, 1);
        }
    `,
    `#version 300 es
        precision mediump float;

        in vec2 fTexCoord;
        in vec4 fColor;
        flat in int fTexture;

        uniform sampler2D uTextures[16];

        out vec4 FragColor;

        void main() {
            if (fTexture == 0)
                FragColor = texture(uTextures[0], fTexCoord);
            else if (fTexture == 1)
                FragColor = texture(uTextures[1], fTexCoord);
            else if (fTexture == 2)
                FragColor = texture(uTextures[2], fTexCoord);
            else if (fTexture == 3)
                FragColor = texture(uTextures[3], fTexCoord);
            else if (fTexture == 4)
                FragColor = texture(uTextures[4], fTexCoord);
            else if (fTexture == 5)
                FragColor = texture(uTextures[5], fTexCoord);
            else if (fTexture == 6)
                FragColor = texture(uTextures[6], fTexCoord);
            else if (fTexture == 7)
                FragColor = texture(uTextures[7], fTexCoord);
            else if (fTexture == 8)
                FragColor = texture(uTextures[8], fTexCoord);
            else if (fTexture == 9)
                FragColor = texture(uTextures[9], fTexCoord);
            else if (fTexture == 10)
                FragColor = texture(uTextures[10], fTexCoord);
            else if (fTexture == 11)
                FragColor = texture(uTextures[11], fTexCoord);
            else if (fTexture == 12)
                FragColor = texture(uTextures[12], fTexCoord);
            else if (fTexture == 13)
                FragColor = texture(uTextures[13], fTexCoord);
            else if (fTexture == 14)
                FragColor = texture(uTextures[14], fTexCoord);
            else if (fTexture == 15)
                FragColor = texture(uTextures[15], fTexCoord);

            FragColor.rgb *= FragColor.a;
            FragColor *= fColor;
        }
    `
);

render.Shader = {
    Program: Shader,
    vPosition:   gl.getAttribLocation(Shader, "vPosition"),
    vTexCoord:   gl.getAttribLocation(Shader, "vTexCoord"),
    vColor:      gl.getAttribLocation(Shader, "vColor"),
    vTexture:    gl.getAttribLocation(Shader, "vTexture"),
    uTextures0:  gl.getUniformLocation(Shader, "uTextures[0]"),
    uTextures1:  gl.getUniformLocation(Shader, "uTextures[1]"),
    uTextures2:  gl.getUniformLocation(Shader, "uTextures[2]"),
    uTextures3:  gl.getUniformLocation(Shader, "uTextures[3]"),
    uTextures4:  gl.getUniformLocation(Shader, "uTextures[4]"),
    uTextures5:  gl.getUniformLocation(Shader, "uTextures[5]"),
    uTextures6:  gl.getUniformLocation(Shader, "uTextures[6]"),
    uTextures7:  gl.getUniformLocation(Shader, "uTextures[7]"),
    uTextures8:  gl.getUniformLocation(Shader, "uTextures[8]"),
    uTextures9:  gl.getUniformLocation(Shader, "uTextures[9]"),
    uTextures10:  gl.getUniformLocation(Shader, "uTextures[10]"),
    uTextures11:  gl.getUniformLocation(Shader, "uTextures[11]"),
    uTextures12:  gl.getUniformLocation(Shader, "uTextures[12]"),
    uTextures13:  gl.getUniformLocation(Shader, "uTextures[13]"),
    uTextures14:  gl.getUniformLocation(Shader, "uTextures[14]"),
    uTextures15:  gl.getUniformLocation(Shader, "uTextures[15]"),
    uProjection: gl.getUniformLocation(Shader, "uProjection")
};

{
    gl.useProgram(render.Shader.Program);

    gl.enableVertexAttribArray(render.Shader.vPosition);
    gl.enableVertexAttribArray(render.Shader.vTexCoord);
    gl.enableVertexAttribArray(render.Shader.vColor);
    gl.enableVertexAttribArray(render.Shader.vTexture);

    gl.uniform1i(render.Shader.uTextures0, 0);
    gl.uniform1i(render.Shader.uTextures1, 1);
    gl.uniform1i(render.Shader.uTextures2, 2);
    gl.uniform1i(render.Shader.uTextures3, 3);
    gl.uniform1i(render.Shader.uTextures4, 4);
    gl.uniform1i(render.Shader.uTextures5, 5);
    gl.uniform1i(render.Shader.uTextures6, 6);
    gl.uniform1i(render.Shader.uTextures7, 7);
    gl.uniform1i(render.Shader.uTextures8, 8);
    gl.uniform1i(render.Shader.uTextures9, 9);
    gl.uniform1i(render.Shader.uTextures10, 10);
    gl.uniform1i(render.Shader.uTextures11, 11);
    gl.uniform1i(render.Shader.uTextures12, 12);
    gl.uniform1i(render.Shader.uTextures13, 13);
    gl.uniform1i(render.Shader.uTextures14, 14);
    gl.uniform1i(render.Shader.uTextures15, 15);
    gl.uniformMatrix3fv(render.Shader.uProjection, false, mat3.projection(mat3.create(), render.viewport.width, render.viewport.height));

    gl.bindBuffer(gl.ARRAY_BUFFER, stupidPos);
    gl.vertexAttribPointer(
        render.Shader.vPosition,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, stupidTexCoord);
    gl.vertexAttribPointer(
        render.Shader.vTexCoord,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, stupidColor);
    gl.vertexAttribPointer(
        render.Shader.vColor,
        4,
        gl.UNSIGNED_BYTE,
        true,
        0,
        0
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, stupidTexture);
    gl.vertexAttribIPointer(
        render.Shader.vTexture,
        1,
        gl.BYTE,
        false,
        0,
        0
    );
}

/*
// we can rescale easily like this:
canvas.style.width  = '128px';
canvas.style.height = '72px';
*/

render.imageLookup = {};
render.images = [];

render.Insert = function Insert(obj) {
    this.subLayerObj.push(obj);
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

    var res = glFonts.BuildBuffers(fontName, height, text, x, y);

    if (res.VertCount == 0)
        return;

    this.Draw(res.Texture, res.Positions, res.TexCoords, res.Colors, res.VertCount);
}

const MAX_VERTS = 32768;

render.CurrentTextures = [];
render.VertCount = 0;
render.PositionBuffer = new Float32Array(2 * MAX_VERTS);
render.TexCoordBuffer = new Float32Array(2 * MAX_VERTS);
render.ColorBuffer = new Uint32Array(1 * MAX_VERTS);
render.TextureBuffer = new Int8Array(1 * MAX_VERTS);

render.Flush = function Flush(reason)
{
    if (this.VertCount == 0)
        return;

    //console.log( "Flushing " + this.VertCount + " verts (" + reason + ")" );

    for (var i = 0; i < this.CurrentTextures.length; i++)
    {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, this.CurrentTextures[i]);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, stupidPos);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        this.PositionBuffer,
        gl.DYNAMIC_DRAW,
        0,
        this.VertCount * 2
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, stupidTexCoord);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        this.TexCoordBuffer,
        gl.DYNAMIC_DRAW,
        0,
        this.VertCount * 2
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, stupidColor);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        this.ColorBuffer,
        gl.DYNAMIC_DRAW,
        0,
        this.VertCount
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, stupidTexture);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        this.TextureBuffer,
        gl.DYNAMIC_DRAW,
        0,
        this.VertCount
    );

    gl.drawArrays(gl.TRIANGLES, 0, this.VertCount);

    X = this.CurrentTextures;

    this.VertCount = 0;
    this.CurrentTextures = [];
}

render.Draw = function Draw(tex, positions, texCoords, colors, vertCount) {
    if (this.VertCount + vertCount > MAX_VERTS)
    {
        this.Flush("Buffer Full");
    }

    var textureId = this.CurrentTextures.indexOf(tex);

    if (textureId == -1 && this.CurrentTextures.length >= 16)
    {
        this.Flush("Textures Full");
    }

    if (textureId == -1)
    {
        textureId = this.CurrentTextures.push(tex) -1;
    }

    this.PositionBuffer.set(positions, this.VertCount * 2);
    this.TexCoordBuffer.set(texCoords, this.VertCount * 2);
    this.ColorBuffer.set(colors, this.VertCount);

    for ( var i = 0; i < vertCount; i++ )
    {
        this.TextureBuffer[this.VertCount + i] = textureId;
    }

    this.VertCount += vertCount;
}

render.RenderItem = function RenderItem(obj) {

}

render.AdvanceFrame = function AdvanceFrame() {
    var gl = this.gl
    this.renderCount = 0;

    this.SetDrawLayer(0, 0);

    // call into lua
    this.RunThread(L);
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var viewport = this.viewport;

    this.layers.forEach( subLayers => {
    subLayers.forEach( subLayer => {
        var length = subLayer.length;
        for ( var i = 0; i < length; i++ )
        {
            var obj = subLayer[i];
            switch (obj.type) {
                case "DrawRect":
                    this.Draw(this.WhiteTex, obj.Positions, obj.TexCoords, obj.Colors, 6);
                    break;

                case "DrawImage":
                    var imgEntry = this.images[obj.image];

                    if (!imgEntry || !imgEntry.loaded || imgEntry.error) {
                        break;
                    }

                    this.Draw(imgEntry.texture, obj.Positions, obj.TexCoords, obj.Colors, 6);
                    break;

                case "DrawString":
                    this.RealDrawString(obj.left, obj.top, obj.font, obj.height, obj.text, obj.align);
                    break;

                case "SetViewport":
                    this.Flush("Viewport Changed");

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
                    gl.uniformMatrix3fv(this.Shader.uProjection, false, mat3.projection(mat3.create(), viewport.width, viewport.height));

                    break;

                default:
                    //console.log("not implemented: " + obj.type);
            }
        }
        subLayer.length = 0;
    } );
    } );

    this.Flush("Frame Ended");
}

var annoying_shit = [
    { r: 0, g: 0, b: 0, a: 255 },
    { r: 255, g: 0, b: 0, a: 255 },
    { r: 0, g: 255, b: 0, a: 255 },
    { r: 0, g: 0, b: 255, a: 255 },
    { r: 255, g: 255, b: 0, a: 255 },
    { r: 255, g: 0, b: 255, a: 255 },
    { r: 0, g: 255, b: 255, a: 255 },
    { r: 255, g: 255, b: 255, a: 255 },
    { r: 178, g: 178, b: 178, a: 255 },
    { r: 102, g: 102, b: 102, a: 255 },
]

render.ColorFromString = function ColorFromString(r, i) {
    i = i || 0;
    var g, b, a = 1;
    if (r[0 + i] != '^') {
        return;
    }
    var len
    if (r[1 + i] == 'x') {
        b = parseInt(r.slice(6 + i, 8 + i), 16);
        g = parseInt(r.slice(4 + i, 6 + i), 16);
        r = parseInt(r.slice(2 + i, 4 + i), 16);
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
    if (layer !== null && layer != this.layer)
    {
        this.layer = layer;

        if ( !this.layers[this.layer] )
            this.layerObj = this.layers[this.layer] = [];
        else
            this.layerObj = this.layers[this.layer];
    }

    if (subLayer !== null)
    {
        this.subLayer = subLayer;
    }
    else
    {
        this.subLayer = 0;
    }

    if ( !this.layerObj[this.subLayer] )
        this.subLayerObj = this.layerObj[this.subLayer] = [];
    else
        this.subLayerObj = this.layerObj[this.subLayer];
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

render.SetDrawColor = function SetDrawColor(color) {
    if (typeof color == "string")
    {
        rgba = render.ColorFromString(color);
        color = ((rgba.a << 24) | (rgba.b << 16) | (rgba.g << 8) | rgba.r);
    }

    this.color = color >>> 0;
}

render.DrawRect = function DrawRect(left, top, width, height) {
    this.Insert({
        type: "DrawRect",

        Positions: [
            left,         top,
            left,         top + height,
            left + width, top + height,
            left,         top,
            left + width, top + height,
            left + width, top,
        ],
        TexCoords: [
            0, 0,
            1, 0,
            0, 1,
            0, 0,
            0, 0,
            1, 1,
        ],
        Colors: [
            this.color,
            this.color,
            this.color,
            this.color,
            this.color,
            this.color,
        ],
    });
}

render.DrawImage = function DrawImage(imgHandle, left, top, width, height, u1, v1, u2, v2) {
    this.Insert({
        type: "DrawImage",
        image: imgHandle,

        Positions: [
            left,         top,
            left,         top + height,
            left + width, top + height,
            left,         top,
            left + width, top + height,
            left + width, top,
        ],
        TexCoords: [
            u1, v1,
            u1, v2,
            u2, v2,
            u1, v1,
            u2, v2,
            u2, v1,
        ],
        Colors: [
            this.color,
            this.color,
            this.color,
            this.color,
            this.color,
            this.color,
        ],
    });
}

render.DrawImageQuad = function DrawImageQuad(imgHandle, x1, y1, x2, y2, x3, y3, x4, y4, s1, t1, s2, t2, s3, t3, s4, t4) {
    this.Insert({
        type: "DrawImage",
        image: imgHandle,

        Positions: [
            x1, y1,
            x2, y2,
            x3, y3,
            x1, y1,
            x3, y3,
            x4, y4,
        ],
        TexCoords: [
            s1, t1,
            s2, t2,
            s3, t3,
            s1, t1,
            s3, t3,
            s4, t4,
        ],
        Colors: [
            this.color,
            this.color,
            this.color,
            this.color,
            this.color,
            this.color,
        ],
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
