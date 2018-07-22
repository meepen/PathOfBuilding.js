var FONTS = {
	"VAR": {},
	"VAR BOLD": {},
	"FIXED": {},
};

var glFonts = window.glFonts = {};

// Glyph Data: x, y, w, padLeft, padRight (we think)

FONTS["FIXED"]["10"] = {
	"SpriteMap": "fonts/Bitstream Vera Sans Mono.10.png",
	"Texture": null, // T.B.L.
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

var loadFont = function loadFont(gl, font)
{
	return new Promise( (resolve, reject) => {
		var img = document.createElement("img");

		font.Texture = gl.createTexture();

		img.onload = () => {
			gl.bindTexture(gl.TEXTURE_2D, font.Texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

			// Might not be power-of-2. We don't care for now, but this wrapping might hurt us
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

			resolve();
		};

		img.onerror = () => {
			gl.bindTexture(gl.TEXTURE_2D, font.Texture);

			var pinkRGBA = new Uint8Array([255, 0, 220, 255]);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pinkRGBA);

			resolve();
		};

		img.src = font.SpriteMap;
	} );
};

glFonts.Load = function Load(gl)
{
	return loadFont(gl, FONTS["FIXED"]["10"]);
}

glFonts.GetDebugTexture = function DebugDraw(gl)
{
	return FONTS["FIXED"]["10"].Texture;
}