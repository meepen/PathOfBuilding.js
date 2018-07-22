var FONTS = {
	"VAR": {},
	"VAR BOLD": {},
	"FIXED": {},
};

var glFonts = window.glFonts = {};

// Glyph Data: x, y, w, padLeft, padRight (we think)

FONTS["FIXED"]["10"] = {
	"SpriteMap": "fonts/Bitstream Vera Sans Mono.10.png",
	"Texture": null, // T.B.L.,
	"TextureWidth": null,
	"TextureHeight": null,
	"Glyphs": [
		[  0,   0,  5,  0,  0], // 0
		[  7,   0,  5,  0,  0], // 1
		[ 14,   0,  5,  0,  0], // 2
		[ 21,   0,  5,  0,  0], // 3
		[ 28,   0,  5,  0,  0], // 4
		[ 35,   0,  5,  0,  0], // 5
		[ 42,   0,  5,  0,  0], // 6
		[ 49,   0,  5,  0,  0], // 7
		[ 56,   0,  5,  0,  0], // 8
		[ 63,   0,  5,  0,  0], // 9
		[ 70,   0,  5,  0,  0], // 10
		[ 77,   0,  5,  0,  0], // 11
		[ 84,   0,  5,  0,  0], // 12
		[ 91,   0,  5,  0,  0], // 13
		[ 98,   0,  5,  0,  0], // 14
		[105,   0,  5,  0,  0], // 15
		[112,   0,  5,  0,  0], // 16
		[119,   0,  5,  0,  0], // 17
		[  0,  12,  5,  0,  0], // 18
		[  7,  12,  5,  0,  0], // 19
		[ 14,  12,  5,  0,  0], // 20
		[ 21,  12,  5,  0,  0], // 21
		[ 28,  12,  5,  0,  0], // 22
		[ 35,  12,  5,  0,  0], // 23
		[ 42,  12,  5,  0,  0], // 24
		[ 49,  12,  5,  0,  0], // 25
		[ 56,  12,  5,  0,  0], // 26
		[ 63,  12,  5,  0,  0], // 27
		[ 70,  12,  5,  0,  0], // 28
		[ 77,  12,  5,  0,  0], // 29
		[ 84,  12,  5,  0,  0], // 30
		[ 91,  12,  5,  0,  0], // 31
		[ 98,  12,  1,  0,  4], // 32 ( )
		[101,  12,  1,  2,  2], // 33 (!)
		[104,  12,  3,  1,  1], // 34 (")
		[109,  12,  5,  0,  0], // 35 (#)
		[116,  12,  5,  1, -1], // 36 ($)
		[  0,  24,  5,  0,  0], // 37 (%)
		[  7,  24,  4,  1,  0], // 38 (&)
		[ 13,  24,  1,  2,  2], // 39 (')
		[ 16,  24,  2,  2,  1], // 40 (()
		[ 20,  24,  2,  2,  1], // 41 ())
		[ 24,  24,  5,  0,  0], // 42 (*)
		[ 31,  24,  5,  0,  0], // 43 (+)
		[ 38,  24,  1,  2,  2], // 44 (,)
		[ 41,  24,  2,  2,  1], // 45 (-)
		[ 45,  24,  1,  2,  2], // 46 (.)
		[ 48,  24,  4,  0,  1], // 47 (/)
		[ 54,  24,  4,  1,  0], // 48 (0)
		[ 60,  24,  3,  2,  0], // 49 (1)
		[ 65,  24,  5,  1, -1], // 50 (2)
		[ 72,  24,  4,  1,  0], // 51 (3)
		[ 78,  24,  4,  1,  0], // 52 (4)
		[ 84,  24,  4,  1,  0], // 53 (5)
		[ 90,  24,  4,  1,  0], // 54 (6)
		[ 96,  24,  4,  1,  0], // 55 (7)
		[102,  24,  4,  1,  0], // 56 (8)
		[108,  24,  4,  1,  0], // 57 (9)
		[114,  24,  1,  2,  2], // 58 (:)
		[117,  24,  1,  2,  2], // 59 (;)
		[120,  24,  5,  1, -1], // 60 (<)
		[  0,  36,  5,  0,  0], // 61 (=)
		[  7,  36,  5,  1, -1], // 62 (>)
		[ 14,  36,  4,  1,  0], // 63 (?)
		[ 20,  36,  4,  1,  0], // 64 (@)
		[ 26,  36,  4,  1,  0], // 65 (A)
		[ 32,  36,  4,  1,  0], // 66 (B)
		[ 38,  36,  4,  1,  0], // 67 (C)
		[ 44,  36,  4,  1,  0], // 68 (D)
		[ 50,  36,  4,  1,  0], // 69 (E)
		[ 56,  36,  4,  1,  0], // 70 (F)
		[ 62,  36,  4,  1,  0], // 71 (G)
		[ 68,  36,  4,  1,  0], // 72 (H)
		[ 74,  36,  3,  1,  1], // 73 (I)
		[ 79,  36,  4,  1,  0], // 74 (J)
		[ 85,  36,  5,  1, -1], // 75 (K)
		[ 92,  36,  4,  1,  0], // 76 (L)
		[ 98,  36,  4,  1,  0], // 77 (M)
		[104,  36,  4,  1,  0], // 78 (N)
		[110,  36,  4,  1,  0], // 79 (O)
		[116,  36,  4,  1,  0], // 80 (P)
		[122,  36,  4,  1,  0], // 81 (Q)
		[  0,  48,  5,  1, -1], // 82 (R)
		[  7,  48,  4,  1,  0], // 83 (S)
		[ 13,  48,  5,  0,  0], // 84 (T)
		[ 20,  48,  4,  1,  0], // 85 (U)
		[ 26,  48,  4,  1,  0], // 86 (V)
		[ 32,  48,  5,  0,  0], // 87 (W)
		[ 39,  48,  4,  1,  0], // 88 (X)
		[ 45,  48,  5,  0,  0], // 89 (Y)
		[ 52,  48,  4,  1,  0], // 90 (Z)
		[ 58,  48,  2,  2,  1], // 91 ([)
		[ 62,  48,  4,  0,  1], // 92 (\)
		[ 68,  48,  2,  2,  1], // 93 (])
		[ 72,  48,  5,  0,  0], // 94 (^)
		[ 79,  48,  5,  0,  0], // 95 (_)
		[ 86,  48,  2,  1,  2], // 96 (`)
		[ 90,  48,  4,  1,  0], // 97 (a)
		[ 96,  48,  4,  1,  0], // 98 (b)
		[102,  48,  4,  1,  0], // 99 (c)
		[108,  48,  4,  1,  0], // 100 (d)
		[114,  48,  4,  1,  0], // 101 (e)
		[120,  48,  4,  1,  0], // 102 (f)
		[  0,  60,  4,  1,  0], // 103 (g)
		[  6,  60,  4,  1,  0], // 104 (h)
		[ 12,  60,  5,  0,  0], // 105 (i)
		[ 19,  60,  3,  1,  1], // 106 (j)
		[ 24,  60,  5,  1, -1], // 107 (k)
		[ 31,  60,  5,  0,  0], // 108 (l)
		[ 38,  60,  5,  1, -1], // 109 (m)
		[ 45,  60,  4,  1,  0], // 110 (n)
		[ 51,  60,  4,  1,  0], // 111 (o)
		[ 57,  60,  4,  1,  0], // 112 (p)
		[ 63,  60,  4,  1,  0], // 113 (q)
		[ 69,  60,  3,  2,  0], // 114 (r)
		[ 74,  60,  4,  1,  0], // 115 (s)
		[ 80,  60,  4,  1,  0], // 116 (t)
		[ 86,  60,  4,  1,  0], // 117 (u)
		[ 92,  60,  6,  0, -1], // 118 (v)
		[100,  60,  5,  0,  0], // 119 (w)
		[107,  60,  4,  1,  0], // 120 (x)
		[113,  60,  5,  1, -1], // 121 (y)
		[120,  60,  4,  1,  0], // 122 (z)
		[  0,  72,  3,  1,  1], // 123 ({)
		[  5,  72,  1,  2,  2], // 124 (|)
		[  8,  72,  3,  1,  1], // 125 (})
		[ 13,  72,  5,  1, -1], // 126 (~)
		[ 20,  72,  5,  0,  0], // 127
	]
};

FONTS["FIXED"]["24"] = {
	"SpriteMap": "fonts/Bitstream Vera Sans Mono.24.png",
	"Texture": null, // T.B.L.,
	"TextureWidth": null,
	"TextureHeight": null,
	"Glyphs": [
		[  0,   0, 11,  1,  1], // 0
		[ 17,   0, 11,  1,  1], // 1
		[ 34,   0, 11,  1,  1], // 2
		[ 51,   0, 11,  1,  1], // 3
		[ 68,   0, 11,  1,  1], // 4
		[ 85,   0, 11,  1,  1], // 5
		[102,   0, 11,  1,  1], // 6
		[  0,  30, 11,  1,  1], // 7
		[ 17,  30, 11,  1,  1], // 8
		[ 34,  30, 11,  1,  1], // 9
		[ 51,  30, 11,  1,  1], // 10
		[ 68,  30, 11,  1,  1], // 11
		[ 85,  30, 11,  1,  1], // 12
		[102,  30, 11,  1,  1], // 13
		[  0,  60, 11,  1,  1], // 14
		[ 17,  60, 11,  1,  1], // 15
		[ 34,  60, 11,  1,  1], // 16
		[ 51,  60, 11,  1,  1], // 17
		[ 68,  60, 11,  1,  1], // 18
		[ 85,  60, 11,  1,  1], // 19
		[102,  60, 11,  1,  1], // 20
		[  0,  90, 11,  1,  1], // 21
		[ 17,  90, 11,  1,  1], // 22
		[ 34,  90, 11,  1,  1], // 23
		[ 51,  90, 11,  1,  1], // 24
		[ 68,  90, 11,  1,  1], // 25
		[ 85,  90, 11,  1,  1], // 26
		[102,  90, 11,  1,  1], // 27
		[  0, 120, 11,  1,  1], // 28
		[ 17, 120, 11,  1,  1], // 29
		[ 34, 120, 11,  1,  1], // 30
		[ 51, 120, 11,  1,  1], // 31
		[ 68, 120,  1,  0, 12], // 32 ( )
		[ 75, 120,  2,  5,  6], // 33 (!)
		[ 83, 120,  6,  3,  4], // 34 (")
		[ 95, 120, 13,  0,  0], // 35 (#)
		[  0, 150,  9,  2,  2], // 36 ($)
		[ 15, 150, 13,  0,  0], // 37 (%)
		[ 34, 150, 12,  1,  0], // 38 (&)
		[ 52, 150,  2,  5,  6], // 39 (')
		[ 60, 150,  5,  4,  4], // 40 (()
		[ 71, 150,  5,  3,  5], // 41 ())
		[ 82, 150,  9,  2,  2], // 42 (*)
		[ 97, 150, 12,  0,  1], // 43 (+)
		[115, 150,  4,  4,  5], // 44 (,)
		[  0, 180,  5,  4,  4], // 45 (-)
		[ 11, 180,  3,  5,  5], // 46 (.)
		[ 20, 180, 10,  1,  2], // 47 (/)
		[ 36, 180, 10,  1,  2], // 48 (0)
		[ 52, 180,  8,  3,  2], // 49 (1)
		[ 66, 180, 11,  2,  0], // 50 (2)
		[ 83, 180, 10,  1,  2], // 51 (3)
		[ 99, 180, 11,  1,  1], // 52 (4)
		[  0, 210, 10,  1,  2], // 53 (5)
		[ 16, 210, 10,  1,  2], // 54 (6)
		[ 32, 210, 10,  1,  2], // 55 (7)
		[ 48, 210, 10,  1,  2], // 56 (8)
		[ 64, 210, 10,  1,  2], // 57 (9)
		[ 80, 210,  3,  5,  5], // 58 (:)
		[ 89, 210,  4,  4,  5], // 59 (;)
		[ 99, 210, 11,  1,  1], // 60 (<)
		[  0, 240, 11,  1,  1], // 61 (=)
		[ 17, 240, 11,  1,  1], // 62 (>)
		[ 34, 240,  8,  3,  2], // 63 (?)
		[ 48, 240, 12,  1,  0], // 64 (@)
		[ 66, 240, 10,  1,  2], // 65 (A)
		[ 82, 240, 10,  1,  2], // 66 (B)
		[ 98, 240, 10,  1,  2], // 67 (C)
		[  0, 270, 10,  1,  2], // 68 (D)
		[ 16, 270, 10,  1,  2], // 69 (E)
		[ 32, 270, 10,  1,  2], // 70 (F)
		[ 48, 270, 10,  1,  2], // 71 (G)
		[ 64, 270, 10,  1,  2], // 72 (H)
		[ 80, 270,  8,  2,  3], // 73 (I)
		[ 94, 270,  9,  1,  3], // 74 (J)
		[109, 270, 12,  1,  0], // 75 (K)
		[  0, 300, 10,  1,  2], // 76 (L)
		[ 16, 300, 10,  1,  2], // 77 (M)
		[ 32, 300, 10,  1,  2], // 78 (N)
		[ 48, 300, 10,  1,  2], // 79 (O)
		[ 64, 300, 10,  1,  2], // 80 (P)
		[ 80, 300, 10,  1,  2], // 81 (Q)
		[ 96, 300, 12,  1,  0], // 82 (R)
		[  0, 330, 10,  1,  2], // 83 (S)
		[ 16, 330, 12,  0,  1], // 84 (T)
		[ 34, 330, 10,  1,  2], // 85 (U)
		[ 50, 330, 10,  1,  2], // 86 (V)
		[ 66, 330, 13,  0,  0], // 87 (W)
		[ 85, 330, 10,  1,  2], // 88 (X)
		[101, 330, 12,  0,  1], // 89 (Y)
		[  0, 360, 10,  1,  2], // 90 (Z)
		[ 16, 360,  4,  5,  4], // 91 ([)
		[ 26, 360, 10,  1,  2], // 92 (\)
		[ 42, 360,  4,  4,  5], // 93 (])
		[ 52, 360, 11,  1,  1], // 94 (^)
		[ 69, 360, 11,  0,  2], // 95 (_)
		[ 86, 360,  5,  3,  5], // 96 (`)
		[ 97, 360, 10,  1,  2], // 97 (a)
		[  0, 390, 10,  1,  2], // 98 (b)
		[ 16, 390,  9,  1,  3], // 99 (c)
		[ 31, 390, 10,  1,  2], // 100 (d)
		[ 47, 390, 10,  1,  2], // 101 (e)
		[ 63, 390,  9,  2,  2], // 102 (f)
		[ 78, 390, 10,  1,  2], // 103 (g)
		[ 94, 390, 10,  1,  2], // 104 (h)
		[110, 390, 10,  2,  1], // 105 (i)
		[  0, 420,  6,  2,  5], // 106 (j)
		[ 12, 420, 10,  1,  2], // 107 (k)
		[ 28, 420, 10,  1,  2], // 108 (l)
		[ 44, 420, 10,  1,  2], // 109 (m)
		[ 60, 420, 10,  1,  2], // 110 (n)
		[ 76, 420, 10,  1,  2], // 111 (o)
		[ 92, 420, 10,  1,  2], // 112 (p)
		[108, 420, 10,  1,  2], // 113 (q)
		[  0, 450,  8,  4,  1], // 114 (r)
		[ 14, 450, 10,  1,  2], // 115 (s)
		[ 30, 450,  9,  1,  3], // 116 (t)
		[ 45, 450, 10,  1,  2], // 117 (u)
		[ 61, 450, 10,  1,  2], // 118 (v)
		[ 77, 450, 13,  0,  0], // 119 (w)
		[ 96, 450, 10,  1,  2], // 120 (x)
		[112, 450, 10,  1,  2], // 121 (y)
		[  0, 480, 10,  1,  2], // 122 (z)
		[ 16, 480,  8,  2,  3], // 123 ({)
		[ 30, 480,  2,  5,  6], // 124 (|)
		[ 38, 480,  8,  2,  3], // 125 (})
		[ 52, 480, 11,  1,  1], // 126 (~)
		[ 69, 480, 11,  1,  1], // 127
	]
};

var loadFont = function loadFont(gl, font)
{
	return new Promise( (resolve, reject) => {
		var img = document.createElement("img");

		font.Texture = gl.createTexture();

		img.onload = () => {
			gl.bindTexture(gl.TEXTURE_2D, font.Texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

			// Might not be power-of-2. We don't care for now, but this might hurt us
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

			font.TextureWidth = img.width;
			font.TextureHeight = img.height;
			resolve();
		};

		img.onerror = () => {
			gl.bindTexture(gl.TEXTURE_2D, font.Texture);

			var pinkRGBA = new Uint8Array([255, 0, 220, 255]);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pinkRGBA);

			font.TextureWidth = 1;
			font.TextureHeight = 1;
			resolve();
		};

		img.src = font.SpriteMap;
	} );
};

var getGlyphs = function getGlyphs(fontName, height)
{
	var x, y;

	if ( !(x = FONTS[fontName]) )
		return null;

	if ( !(y = x[height]) )
		return null;

	return y.Glyphs;
}

//
// Loads all the data necessary to render fonts
// Returns a promise
//
glFonts.Load = function Load(gl)
{
	var fontLoaders = [
		loadFont(gl, FONTS["FIXED"]["10"]),
		loadFont(gl, FONTS["FIXED"]["24"]),
	];

	return Promise.all(fontLoaders);
}

glFonts.GetTextWidth = function GetTextWidth(fontName, height, text)
{
	var glyphs = getGlyphs(fontName, height);
	var width = 0;

	for (var i = 0; i < text.length; i++)
	{
		var glyph = glyphs[text.charCodeAt(i)];

		if (!glyph)
			glyph = glyphs[0];

		width += glyph[2] + glyph[3] + glyph[4]; // TODO: Do we need to cut off glyph[4] for the last character?
	}

	return width;
}

//
// Returns arrays of vertex-positions & texture-coordinates needed to render the given text
//
glFonts.BuildBuffers = function GetTextBuffers(fontName, height, text, baseX, baseY)
{
	var font = FONTS[fontName][height];
	var glyphs = getGlyphs(fontName, height);

	var positions = new Float32Array(text.length * 12);
	var texCoords = new Float32Array(text.length * 12);

	var baseX = baseX;

	for (var i = 0; i < text.length; i++)
	{
		var glyph = glyphs[text.charCodeAt(i)];

		if (!glyph)
			glyph = glyphs[0];

		baseX += glyph[3];

		var pxTL = baseX;
		var pyTL = baseY;
		var pxTR = baseX + glyph[2];
		var pyTR = baseY;
		var pxBR = baseX + glyph[2];
		var pyBR = baseY + height;
		var pxBL = baseX;
		var pyBL = baseY + height;

		var txTL = glyph[0] / font.TextureWidth;
		var tyTL = glyph[1] / font.TextureHeight;
		var txTR = (glyph[0] + glyph[2]) / font.TextureWidth;
		var tyTR = glyph[1] / font.TextureHeight;
		var txBR = (glyph[0] + glyph[2]) / font.TextureWidth;
		var tyBR = (glyph[1] + height) / font.TextureHeight;
		var txBL = glyph[0] / font.TextureWidth;
		var tyBL = (glyph[1] + height) / font.TextureHeight;

		/// Triangle #1
		// TL
		positions[i * 12 + 0] = pxTL;
		positions[i * 12 + 1] = pyTL;
		texCoords[i * 12 + 0] = txTL;
		texCoords[i * 12 + 1] = tyTL;

		// BL
		positions[i * 12 + 2] = pxBL;
		positions[i * 12 + 3] = pyBL;
		texCoords[i * 12 + 2] = txBL;
		texCoords[i * 12 + 3] = tyBL;

		// TR
		positions[i * 12 + 4] = pxTR;
		positions[i * 12 + 5] = pyTR;
		texCoords[i * 12 + 4] = txTR;
		texCoords[i * 12 + 5] = tyTR;

		/// Triangle #2
		// TR
		positions[i * 12 + 6] = pxTR;
		positions[i * 12 + 7] = pyTR;
		texCoords[i * 12 + 6] = txTR;
		texCoords[i * 12 + 7] = tyTR;

		// BL
		positions[i * 12 + 8] = pxBL;
		positions[i * 12 + 9] = pyBL;
		texCoords[i * 12 + 8] = txBL;
		texCoords[i * 12 + 9] = tyBL;

		// BR
		positions[i * 12 + 10] = pxBR;
		positions[i * 12 + 11] = pyBR;
		texCoords[i * 12 + 10] = txBR;
		texCoords[i * 12 + 11] = tyBR;

		baseX += glyph[2] + glyph[4];
	}

	return { Texture: FONTS[fontName][height].Texture, Positions: positions, TexCoords: texCoords };
}

glFonts.GetDebugTexture = function DebugDraw(gl)
{
	return FONTS["FIXED"]["10"].Texture;
}