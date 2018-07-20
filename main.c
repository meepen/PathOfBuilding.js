
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

struct reg emscripten[] = {
        {"run", &run},
        {"SetDrawColor", &SetDrawColor},
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