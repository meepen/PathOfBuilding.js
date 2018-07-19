local js = require("js")

-- cache the requires to runtime libraries
package.path = "./runtime/?.lua"

require("xml")
require("dkjson")
require("sha1")
require("base64")

-- override the package path and dofile paths to go into submodules
package.path = "./PathOfBuilding/?.lua"

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


function io.open(fpath, mode)
    if (mode:find "r" and not fs[fpath]) then
        return
    end
    return setmetatable({
        path = fpath,
        mode = mode
    }, FILE_MT);
end

-- 5.1 compat
unpack = table.unpack
bit = {
    bor = function(val, ...)
        for i = 2, select("#", ...) do
            val = val | (select(i, ...))
        end
    end
}
--[[
local _pairs = pairs

-- repair regular pairs behavior from lua/luajit
-- basically does ipairs first, then any other values
local ipairs_aux = ipairs(t, nil)

local function pairs_aux(t, k)
    if (k == nil) then
        return t.first_k, t.t[t.first_k]
    else
        local k = t.iter[k]
        return k, t.t[k]
    end
end

function pairs2(t)
    local function n(val)
        local t = val
        if (not val.max) then
            local k, v = ipairs_aux(t, val.last)
            if (k) then
                val.done[k] = true
                val.last = k
                return k, v
            end
            val.max = true
            val.last = nil
        end
        local pairs_aux = _pairs(t, k)
        local k, v = val.last
        repeat
            k, v = pairs_aux(t, val.last)    
        until not k or not val.done[k]
        val.last = k
        return val, k
    end

    local last_k, first_k = {}
    local start_k = last_k

    local values = {
        t = t,
        iter = {}
    }

    for _, k in n, {
        t = t,
        last = 0,
        done = {}
    } do
        values.iter[last_k] = k
        last_k = k
    end

    return pairs_aux, values, start_k
end]]