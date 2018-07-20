local js = require "js"

package.path = "./runtime/?.lua;./PathOfBuilding/?.lua"

local _dofile = dofile
function dofile(fpath, ...)
    return _dofile("./PathOfBuilding/"..fpath)
end
local _loadfile = loadfile
function loadfile(fpath, ...)
    return _loadfile("./PathOfBuilding/"..fpath)
end

-- create a fake io library
io = {}
local fs = js.global.localStorage
-- don't check for updates
fs["UpdateCheck.lua"] = ""
-- don't run first run files
fs["first.run"] = nil

local FILE = {}
local FILE_MT = {
    __index = FILE
}
function FILE:close()
end
function FILE:flush()
end
function FILE:read(what)
    if (what == "*a") then
        return fs[self.path]
    else
        error("not implemented: "..what)
    end
end
function FILE:write(...)
    if self.mode ~= "w" and self.mode ~= "wb" then
        return
    end

    for _, data in pairs{...--[[sue me]]} do
        fs[self.path] = fs[self.path] .. data
    end
end


function io.open(fpath, mode)
    if (mode:find "r" and not fs[fpath]) then
        return
    end
    if (mode == "w" or mode == "wb") then
        fs[fpath] = ""
    end
    return setmetatable({
        path = fpath,
        mode = mode
    }, FILE_MT);
end

-- 5.1 compat
unpack = table.unpack
bit = {
    band = function(val, ...)
        for i = 2, select("#", ...) do
            val = val & (select(i, ...))
        end

        return val
    end,
    bor = function(val, ...)
        for i = 2, select("#", ...) do
            val = val | (select(i, ...))
        end

        return val
    end,
    bnot = function(val)
        return ~val
    end
}

local _pairs = pairs

-- repair regular pairs behavior from lua/luajit
-- basically does ipairs first, then any other values
local ipairs_aux = ipairs({}, nil)

local function n(val)
    local t = val.t
    if (not val.max) then
        local k, v = ipairs_aux(t, val.last)
        if (k) then
            val.done[k] = true
            val.last = k
            return k, t[k]
        end
        val.max = true
        val.last = nil
    end
    local pairs_aux = _pairs(t)
    local k, v = val.last
    repeat
        k, v = pairs_aux(t, k)    
    until not k or not val.done[k]
    if (k) then
        val.done[k] = true
    end
    val.last = k
    return k, t[k]
end

function pairs(t)
    return n, {
        t = t,
        last = 0,
        done = {}
    }
end

function loadstring(str)
    return load(str, nil, "t")
end

-- string.format safety net
do
    local original = string.format

    function string.format( format, ... )
        local success, output = pcall( original, format, ... )

        if success then return output end
        return "(Failed) " .. format
    end
end

do
    local original = require

    function require( lib, ... )
        print( "Loading", lib )
        local ret =  original( lib, ... )
        print( "Loaded", lib )
        return ret
    end
end