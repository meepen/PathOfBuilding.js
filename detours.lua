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

local FILE = {}
function FILE:close()
end
function FILE:flush()
end

local fs = js.global.localStorage

function io.open(fpath, mode)
    if (mode:find "r" and not fs[fpath]) then
        return
    end
    return setmetatable({
        path = fpath,
        mode = mode
    }, FILE);
end