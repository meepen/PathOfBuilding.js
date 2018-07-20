local js = require "emscripten"

package.path = "./runtime/?.lua;./PathOfBuilding/?.lua"

function loadfile(str)
    return coroutine.yield('loadfile', "./PathOfBuilding/"..str)
end
function dofile(str)
    return loadfile(str)()
end

-- create a fake io library
io = {}

-- don't check for updates
js.SetFileData("UpdateCheck.lua", "")
-- don't run first run files
js.SetFileData("first.run", nil)
print(js.GetFileData("first.run"))
error();

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
        return js.GetFileData(self.path)
    else
        error("not implemented: "..what)
    end
end
function FILE:write(...)
    if self.mode ~= "w" and self.mode ~= "wb" then
        return
    end

    for _, data in pairs{...--[[sue me]]} do
        js.AppendFile(self.path, data)
    end
end
function io.open(fpath, mode)
    if (mode:find "r" and not js.GetFileData(fpath)) then
        return
    end
    if (mode == "w" or mode == "wb") then
        js.SetFileData(fpath, "")
    end
    return setmetatable({
        path = fpath,
        mode = mode
    }, FILE_MT);
end

-- 5.1 compat
unpack = table.unpack
bit = require "bit32"

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
    function require(str, ...)
        local loaded = package.preload[str] or package.loaded[str]
        if (loaded) then
            return loaded
        end

        local str2 = str:gsub("%.","/")
        for m in package.path:gmatch "[^;]+" do
            local data = coroutine.yield("loadfile", m:gsub("?", str2))
            if (data) then
                loaded = data(...)
                package.loaded[str] = loaded
                return loaded
            end
        end

        error("couldn't find "..str)
    end
end