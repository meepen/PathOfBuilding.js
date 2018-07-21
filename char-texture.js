ctexture = {
    ctx: document.createElement("canvas").getContext("2d"),
    textures: {}
}

ctexture.ctx.fillStyle = "white"

var GetPowerOfTwo = function GetPowerOfTwo(num) {
    return Math.pow(2, Math.ceil(Math.log(size) / Math.log(2)));
}

ctexture.GetTexture = function GetTexture(gl, text, i) {
    var code = text.slice(i, i + 1);
    var idx = code + gl.font;
    var tex = this.textures[idx];
    if (tex) {
        return tex;
    }

    this.ctx.font = gl.font;

    var size = this.ctx.measureText(code);

    var res = {
        w: size.width,
        h: size
    }

    this.ctx.canvas.width = GetPowerOfTwo(res.w);
    this.ctx.canvas.height = GetPowerOfTwo(res.h);

    this.ctx.fillStyle = "white";
    this.ctx.fillText(code, 0, 0)

    tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.ctx.canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    res.tex = tex;
    res.tw = w / this.canvas.width,
    res.th = h / this.canvas.height

    this.textures[idx] = res;

    return obj;
}