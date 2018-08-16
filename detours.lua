local js = require "emscripten"


local wait_time = 0.1
local next_time = os.clock() + wait_time
local logs = {
    samples = 0
}
debug.sethook(function(e)
    local now = os.clock()
    if (now < next_time) then
        return
    end

    next_time = now + wait_time

    local source = debug.getinfo(2)
    local id = source.short_src..":"..source.currentline

    logs[id] = (logs[id] or 0) + 1
    logs.samples = logs.samples + 1
end, "l")

function reset_logs()
    local tmp = {}
    for id, count in pairs(logs) do
        if (id ~= "samples") then
            tmp[#tmp + 1] = {count, id}
        end
    end
    table.sort(tmp, function(a,b) return a[1] > b[1] end)
    for i = 1, #tmp do
        print(string.format("%.02f%% - %s", tmp[i][1] / logs.samples * 100, tmp[i][2]))
    end
    logs = {
        samples = 0
    }
end

package.path = "./runtime/?.lua;./PathOfBuilding/?.lua"

local old_loadfile = loadfile
function loadfile(str)
    str = "PathOfBuilding/"..str
    js.LoadFileToDisk(str)
    local fn, err = old_loadfile(str)
    if (not fn) then
        error(err)
    end
    return fn
end
function dofile(str)
    return loadfile(str)()
end

-- don't check for updates
local update = io.open("UpdateCheck.lua", "wb")
update:close()
-- don't run first run files
os.remove("first.run")

-- 5.1 compat
unpack = table.unpack
bit = require "bit32"

function loadstring(str)
    return load(str, nil, "t")
end

-- string.format safety net (luajit compat)
do
    local original = string.format

    function string.format( format, ... )
        -- todo: maybe do this better?
        format = format:gsub("(%%%+*)d", "%1.2f")
        local success, output = pcall( original, format, ... )

        if success then return output end
        print(output, format, ...)
        return "(Failed) " .. format
    end
end

do
    local old_require = require
    function require(str, ...)
        local str2 = str:gsub("%.","/")
        for m in package.path:gmatch "[^;]+" do
            js.LoadFileToDisk(m:gsub("?", str2))
        end

        return old_require(str)
    end
end