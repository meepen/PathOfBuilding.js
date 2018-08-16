#include <stdlib.h>
#include <math.h>
#include <emscripten.h>
#include <lauxlib.h>
#include <lualib.h>
#include <string.h>
#include "lua.h"

struct reg {
	const char *name;
	lua_CFunction func;
};

static int run(lua_State *L) {
	emscripten_run_script(luaL_checkstring(L, 1));
	return 0;
}

static int SetDrawColor(lua_State *L) {
	if (lua_type(L, -1) == LUA_TSTRING) {
		EM_ASM_({
			render.SetDrawColor($0);
		}, lua_tostring(L, 1));
		return 0;
	}

	uint8_t rgba[4] = { 0, 0, 0, 255 };
	int top = lua_gettop(L);
	if (top > 4) top = 4;

	for (int i = 0; i < top; i++) {
		if (lua_type(L, i + 1) != LUA_TNUMBER)
			continue;

		float fl = fmax(0.f, lua_tonumber(L, i + 1));
		rgba[i] = (uint8_t) floorf(fl >= 1.f ? 255 : fl * 256.f);
	}

	uint32_t color = (rgba[3] << 24) | (rgba[2] << 16) | (rgba[1] << 8) | rgba[0];

	EM_ASM_(({
		render.SetDrawColor($0);
	}), color);
	return 0;
}

static int DrawImage(lua_State *L) {
	if (lua_type(L, 1) != LUA_TNIL) {

		lua_getfield(L, 1, "idx");
		int idx = lua_tonumber(L, -1);
		lua_pop(L, 1);

		if (lua_gettop(L) == 5) {
			EM_ASM_(({
				render.DrawImage($0, $1, $2, $3, $4, 0, 0, 1, 1);
			}), idx, lua_tonumber(L, 2), lua_tonumber(L, 3), lua_tonumber(L, 4), lua_tonumber(L, 5));
		}
		else {
			EM_ASM_(({
				render.DrawImage($0, $1, $2, $3, $4, $5, $6, $7, $8);
			}), idx, lua_tonumber(L, 2), lua_tonumber(L, 3), lua_tonumber(L, 4), lua_tonumber(L, 5),
				lua_tonumber(L, 6), lua_tonumber(L, 7), lua_tonumber(L, 8), lua_tonumber(L, 9));
		}
	}
	else {
		EM_ASM_(({
			render.DrawRect($0, $1, $2, $3);
		}), lua_tonumber(L, 2), lua_tonumber(L, 3), lua_tonumber(L, 4), lua_tonumber(L, 5));
	}
	return 0;
}

static int DrawImageQuad(lua_State *L) {
	// blame these defines for not supporting more than 10 args
	EM_ASM_(({
		render.DrawImageQuad1($0, $1, $2, $3, $4, $5, $6, $7, $8);
	}),
		lua_tonumber(L, 1),
		lua_tonumber(L, 2),
		lua_tonumber(L, 3),
		lua_tonumber(L, 4),
		lua_tonumber(L, 5),
		lua_tonumber(L, 6),
		lua_tonumber(L, 7),
		lua_tonumber(L, 8),
		lua_tonumber(L, 9)
	);
	EM_ASM_(({
		render.DrawImageQuad2($0, $1, $2, $3, $4, $5, $6, $7);
	}),
		lua_tonumber(L, 10),
		lua_tonumber(L, 11),
		lua_tonumber(L, 12),
		lua_tonumber(L, 13),
		lua_tonumber(L, 14),
		lua_tonumber(L, 15),
		lua_tonumber(L, 16),
		lua_tonumber(L, 17)
	);
	return 0;
}

static int DrawString(lua_State *L) {
	EM_ASM_(({
		render.DrawString($0, $1, Pointer_stringify($2), $3, Pointer_stringify($4), Pointer_stringify($5));
	}), lua_tonumber(L, 1), lua_tonumber(L, 2), lua_tostring(L, 3), lua_tonumber(L, 4), lua_tostring(L, 5), lua_tostring(L, 6));
	return 0;
}

static int DrawStringWidth(lua_State *L) {
	int width = EM_ASM_INT(({
		return render.DrawStringWidth($0, Pointer_stringify($1), Pointer_stringify($2)); 
	}),
		lua_tonumber(L, 1), 
		lua_tostring(L, 2),
		lua_tostring(L, 3));

	lua_pushnumber(L, width);
	return 1;
}

static int SetDrawLayer(lua_State *L) {
	if (lua_type(L, 1) == LUA_TNUMBER) {
		if (lua_type(L, 2) == LUA_TNUMBER) {
			EM_ASM_(({
				render.SetDrawLayer($0, $1);
			}), lua_tonumber(L, 1), lua_tonumber(L, 2));
		}
		else {
			EM_ASM_(({
				render.SetDrawLayer($0, null);
			}), lua_tonumber(L, 1));
		}
	}
	else if (lua_type(L, 2) == LUA_TNUMBER) {
		EM_ASM_(({
			render.SetDrawLayer(null, $0);
		}), lua_tonumber(L, 2));
	}
	else {
		EM_ASM(({
			render.SetDrawLayer(null, null);
		}));
	}

	return 0;
}

static int SetViewport(lua_State *L) {
	if (lua_type(L, 1) == LUA_TNUMBER) {
		EM_ASM_(({
			render.SetViewport($0, $1, $2, $3);
		}), lua_tonumber(L, 1), lua_tonumber(L, 2), lua_tonumber(L, 3), lua_tonumber(L, 4));
	}
	else {
		EM_ASM(({
			render.SetViewport(null, null, null, null);
		}));
	}
	return 0;
}

static int GetCursorPos(lua_State *L) {
	lua_pushinteger(L, EM_ASM_INT(({
		return render.cx;
	})));
	lua_pushinteger(L, EM_ASM_INT(({
		return render.cy;
	})));
	return 2;
}

static int SetTitle(lua_State *L) {
	EM_ASM_(({
		document.title = Pointer_stringify($0);
	}), lua_tostring(L, 1));
	return 0;
}

static int LoadImageCont(lua_State* L, int status, lua_KContext ctx)
{
	int idx = (int) ctx;

	int loaded = EM_ASM_INT(({
		return render.IsImageLoaded($0) ? 1 : 0;
	}), idx);

	if ( loaded )
	{
		int width = EM_ASM_INT(({
			return render.ImageWidth($0);
		}), idx);

		int height = EM_ASM_INT(({
			return render.ImageHeight($0);
		}), idx);

		lua_pushnumber(L, idx);
		lua_pushnumber(L, width);
		lua_pushnumber(L, height);
		return 3;
	}

	// Keep yielding until the image has loaded
	lua_pushstring(L, "LoadImage!");
	return lua_yieldk(L, 1, ctx, LoadImageCont);
}

static int LoadImage(lua_State *L) {
	int idx = EM_ASM_INT(({
		return render.LoadImage(Pointer_stringify($0));
	}), lua_tostring(L, 1));

	lua_pushstring(L, "LoadImage!");
	return lua_yieldk(L, 1, (lua_KContext) idx, LoadImageCont);
}

static int LoadFileToDiskCont(lua_State* L, int status, lua_KContext ctx) {
	const char *fname  = (const char *) ctx;

	int loaded = EM_ASM_INT(({
		return render.IsFileLoaded(Pointer_stringify($0)) ? 1 : 0;
	}), fname);

	// if we loaded, return
	if (loaded)
		return 0;

	// Keep yielding until the file has loaded
	lua_pushstring(L, "LoadFile!");
	return lua_yieldk(L, 1, ctx, LoadFileToDiskCont);
}

static int LoadFileToDisk(lua_State *L) {
	const char *fname = lua_tostring(L, 1);

	int idx = EM_ASM_INT(({
		return render.LoadFileToDisk(Pointer_stringify($0));
	}), lua_tostring(L, 1));

	if (idx == -1) {
		return 0;
	}

	lua_pushstring(L, "LoadFile!");
	return lua_yieldk(L, 1, (lua_KContext)fname, LoadFileToDiskCont); 
}

static int IsKeyDown(lua_State *L) {
	int down = EM_ASM_INT(({
		return render.IsKeyDown(Pointer_stringify($0)) ? 1 : 0;
	}),
		lua_tostring(L, 1)
	);

	lua_pushboolean(L, down);
	return 1;
}

struct reg emscripten[] = {
	{"run", &run},
	{"SetDrawColor", &SetDrawColor},
	{"DrawImage", &DrawImage},
	{"DrawImageQuad", &DrawImageQuad},
	{"DrawString", &DrawString},
	{"DrawStringWidth", &DrawStringWidth},
	{"SetDrawLayer", &SetDrawLayer},
	{"SetViewport", &SetViewport},
	{"GetCursorPos", &GetCursorPos},
	{"SetTitle", &SetTitle},
	{"LoadImage", &LoadImage},
	{"LoadFileToDisk", &LoadFileToDisk},
	{"IsKeyDown", &IsKeyDown},
	{0, 0}
};

static void lua_call2(lua_State *L, int nargs, int nresults) {
	return lua_call(L, nargs, nresults);
}
static const char *lua_tostring2(lua_State *L, int npos) {
	return lua_tostring(L, npos);
}

#undef lua_tostring
#undef lua_call
#undef lua_pop
void lua_call(lua_State *L, int nargs, int nresults) {
	lua_call2(L, nargs, nresults);
}
const char *lua_tostring(lua_State *L, int npos) {
	return lua_tostring2(L, npos);
}
void lua_pop(lua_State *L, int cnt) {
	lua_settop(L, lua_gettop(L) - cnt);
}

void lua_openemscripten(lua_State *L) {
	lua_pushglobaltable(L);
	lua_getfield(L, -1, "package");
	lua_getfield(L, -1, "loaded");
	lua_newtable(L);
	for (int i = 0; i < sizeof(emscripten) / sizeof(*emscripten); i++) {
		lua_pushcfunction(L, emscripten[i].func);
		lua_setfield(L, -2, emscripten[i].name);
	}
	lua_setfield(L, -2, "emscripten");
	lua_pop(L, 1);
}
