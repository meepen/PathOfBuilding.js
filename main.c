#include <stdlib.h>
#include <emscripten.h>
#include <lauxlib.h>
#include <lualib.h>
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
	}
	else {
		float colors[4] = { 0, 0, 0, 1 };
		int top = lua_gettop(L);
		if (top > 4)
			top = 4;
		for (int i = 0; i < top; i++) {
			if (lua_type(L, i + 1) == LUA_TNUMBER)
				colors[i] = lua_tonumber(L, i + 1);
		}

		EM_ASM_(({
			render.SetDrawColor.apply(render, arguments);
		}), colors[0], colors[1], colors[2], colors[3]);
	}
	return 0;
}

static int DrawImage(lua_State *L) {
	if (lua_type(L, 1) != LUA_TNIL) {
		EM_ASM_(({
			render.DrawImage($0, $1, $2, $3, $4, $5, $6, $7, $8);
		}), lua_tonumber(L, 1), lua_tonumber(L, 2), lua_tonumber(L, 3), lua_tonumber(L, 4), lua_tonumber(L, 5),
			lua_tonumber(L, 6), lua_tonumber(L, 7), lua_tonumber(L, 8), lua_tonumber(L, 9));
	}
	else {
		EM_ASM_(({
			render.DrawRect($0, $1, $2, $3);
		}), lua_tonumber(L, 2), lua_tonumber(L, 3), lua_tonumber(L, 4), lua_tonumber(L, 5));
	}
	return 0;
}

static int DrawImageQuad(lua_State *L) {
	EM_ASM_(({
		_js_arguments = [$0, $1, $2, $3, $4, $5, $6, $7, $8, $9];
	}),
		lua_tonumber(L, 1),
		lua_tonumber(L, 2),
		lua_tonumber(L, 3),
		lua_tonumber(L, 4),
		lua_tonumber(L, 5),
		lua_tonumber(L, 6),
		lua_tonumber(L, 7),
		lua_tonumber(L, 8),
		lua_tonumber(L, 9),
		lua_tonumber(L, 10)
	);
	EM_ASM_(({
		_js_arguments.push($0, $1, $2, $3, $4, $5, $6);
		render.DrawImageQuad.apply(render, _js_arguments);
		delete _js_arguments;
	}),
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

static int AppendFile(lua_State *L) {
	EM_ASM_(({
		localStorage[Pointer_stringify($0)] += Pointer_stringify($1);
	}), lua_tostring(L, 1), lua_tostring(L, 2));
	return 0;
}
static int SetFileData(lua_State *L) {
	if (lua_type(L, 2) == LUA_TSTRING) {
		EM_ASM_(({
			localStorage[Pointer_stringify($0)] = Pointer_stringify($1);
		}), lua_tostring(L, 1), lua_tostring(L, 2));
	}
	else {
		EM_ASM_(({
			delete localStorage[Pointer_stringify($0)];
		}), lua_tostring(L, 1));
	}
	return 0;
}
static int GetFileData(lua_State *L) {
	char *str = (char *)EM_ASM_INT(({
		var str = localStorage[Pointer_stringify($0)];
		if (str === undefined)
			return 0;
		var bufferSize = Module.lengthBytesUTF8(str);
		var bufferPtr = Module._malloc(bufferSize + 1);
		Module.stringToUTF8(str, bufferPtr, bufferSize + 1);
		return bufferPtr;
	}), lua_tostring(L, 1));

	lua_pushstring(L, str);

	free(str);

	return 1;
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

static int LoadFileCont(lua_State* L, int status, lua_KContext ctx)
{
	int idx = (int) ctx;

	int loaded = EM_ASM_INT(({
		return render.IsFileLoaded($0) ? 1 : 0;
	}), idx);

	if ( loaded )
	{
		char *data = (char *) EM_ASM_INT(({
			var str = render.FileData($0);
			var bufferSize = Module.lengthBytesUTF8(str);
			var bufferPtr = Module._malloc(bufferSize + 1);
			Module.stringToUTF8(str, bufferPtr, bufferSize + 1);
			return bufferPtr;
		}), idx);

		if ( luaL_loadstring(L, data) != LUA_OK )
			lua_error(L);

		return 1;
	}

	// Keep yielding until the file has loaded
	lua_pushstring(L, "LoadFile!");
	return lua_yieldk(L, 1, ctx, LoadFileCont);
}

static int LoadFile(lua_State *L) {
	int idx = EM_ASM_INT(({
		return render.LoadFile(Pointer_stringify($0));
	}), lua_tostring(L, 1));

	lua_pushstring(L, "LoadFile!");
	return lua_yieldk(L, 1, (lua_KContext) idx, LoadFileCont); 
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
	{"GetFileData", &GetFileData},
	{"AppendFile", &AppendFile},
	{"SetFileData", &SetFileData},
	{"LoadImage", &LoadImage},
	{"LoadFile", &LoadFile},
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
