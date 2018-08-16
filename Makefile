all: main.o

main.o: main.c lua
	emcc -ffast-math -Ilua-5.3.5/src main.c lua-5.3.5/src/liblua.a -s WASM=1 -s ASSERTIONS=1 -O3 -o lua535.js -s EXPORTED_FUNCTIONS="['_lua_tonumberx','_lua_type','_lua_pushnumber','_luaL_newstate','_luaL_loadstring','_lua_tostring','_lua_settop','_lua_call','_lua_resume','_lua_newthread','_lua_openemscripten','_luaL_openlibs','_lua_pop','_lua_pushstring','_lua_createtable','_lua_setfield','_lua_rawseti']" -s 'EXTRA_EXPORTED_RUNTIME_METHODS=["ccall","cwrap","lengthBytesUTF8","stringToUTF8"]' -s ALLOW_MEMORY_GROWTH=1

lua:
	cd lua-5.3.5/src && make generic CC='emcc -s WASM=1'
