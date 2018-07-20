#@
-- This wrapper allows the program to run headless on any OS (in theory)
-- It can be run using a standard lua interpreter, although LuaJIT is preferable

local js = require "emscripten"

-- Callbacks
local callbackTable = { }
local mainObject
function runCallback(name, ...)
	if callbackTable[name] then
		return callbackTable[name](...)
	elseif mainObject and mainObject[name] then
		return mainObject[name](mainObject, ...)
	end
end
function SetCallback(name, func)
	callbackTable[name] = func
end
function GetCallback(name)
	return callbackTable[name]
end
function SetMainObject(obj)
	mainObject = obj
end

-- Image Handles
local imageHandleClass = { }
local imagemt = {__index = imageHandleClass}
function NewImageHandle()
	return setmetatable({}, imagemt)
end
function imageHandleClass:Load(fileName, ...)
	self.file = fileName
	self.width, self.height = coroutine.yield("LoadImage", fileName)
end
function imageHandleClass:Unload() end
function imageHandleClass:SetLoadingPriority(pri) end
function imageHandleClass:ImageSize()
	return self.width, self.height
end

-- Rendering
function RenderInit() end
function GetScreenSize()
	return 1280, 720
end
function SetClearColor(r, g, b, a)
	--yield("SetClearColor", r, g, b, a)
end
function SetDrawLayer(layer, subLayer)
	js.SetDrawLayer(layer, subLayer)
end
function SetViewport(x, y, width, height)
	js.SetViewport(x, y, width, height)
end

do
	local _r, _g, _b, _a
	function SetDrawColor(r, g, b, a)
		if _r == r and _g == g and _b == b and _a == a then
			return
		end

		_r = r
		_g = g
		_b = b
		_a = a

		js.SetDrawColor(r, g, b, a)
	end
end

function DrawImage(imgHandle, left, top, width, height, tcLeft, tcTop, tcRight, tcBottom)
	js.DrawImage(imgHandle and imgHandle.file or nil, left, top, width, height, tcLeft, tcTop, tcRight, tcBottom)
end
function DrawImageQuad(imageHandle, x1, y1, x2, y2, x3, y3, x4, y4, s1, t1, s2, t2, s3, t3, s4, t4)
	--yield("DrawImageQuad", imageHandle, x1, y1, x2, y2, x3, y3, x4, y4, s1, t1, s2, t2, s3, t3, s4, t4)
end
function DrawString(left, top, align, height, font, text)
	js.DrawString(left, top, align, height, font, text)
end
function DrawStringWidth(height, font, text)
	--yield("DrawStringWidth", height, font, text)
	return 8 * text:len()
end
function DrawStringCursorIndex(height, font, text, cursorX, cursorY)
	return 0
end
function StripEscapes(text)
	return text:gsub("^%d",""):gsub("^x%x%x%x%x%x%x","")
end
function GetAsyncCount()
	return 0
end

-- Search Handles
function NewFileSearch() end

-- General Functions
function SetWindowTitle(title)
	js.SetTitle(title);
end
function GetCursorPos()
	return js.GetCursorPos()
end
function SetCursorPos(x, y) end
function ShowCursor(doShow) end
function IsKeyDown(keyName) end
function Copy(text) end
function Paste() end
function Deflate(data)
	-- TODO: Might need this
	return ""
end
function Inflate(data)
	-- TODO: And this
	return ""
end
function GetTime()
	return 0
end
function GetScriptPath()
	return ""
end
function GetRuntimePath()
	return ""
end
function GetUserPath()
	return ""
end
function MakeDir(path) end
function RemoveDir(path) end
function SetWorkDir(path) end
function GetWorkDir()
	return ""
end
function LaunchSubScript(scriptText, funcList, subList, ...) end
function AbortSubScript(ssID) end
function IsSubScriptRunning(ssID) end
function LoadModule(fileName, ...)
	if not fileName:match("%.lua") then
		fileName = fileName .. ".lua"
	end
	local func, err = loadfile(fileName)
	if func then
		return func(...)
	else
		error("LoadModule() error loading '"..fileName.."': "..err)
	end
end
function PLoadModule(fileName, ...)
	if not fileName:match("%.lua") then
		fileName = fileName .. ".lua"
	end
	local func, err = loadfile(fileName)
	if func then
		return PCall(func, ...)
	else
		error("PLoadModule() error loading '"..fileName.."': "..err)
	end
end
function PCall(func, ...)
	local ret = { pcall(func, ...) }
	if ret[1] then
		table.remove(ret, 1)
		return nil, unpack(ret)
	else
		return ret[2]
	end	
end
function ConPrintf(fmt, ...)
	-- Optional
	-- check if our main thread
	print(string.format(fmt, ...))
end
function ConPrintTable(tbl, noRecurse) end
function ConExecute(cmd) end
function ConClear() end
function SpawnProcess(cmdName, args) end
function OpenURL(url) end
function SetProfiling(isEnabled) end
function Restart() end
function Exit() end

dofile("Launch.lua")

runCallback("OnInit")

runCallback("OnFrame") -- Need at least one frame for everything to initialise

if mainObject.promptMsg then
	-- Something went wrong during startup
	print(mainObject.promptMsg)
	io.read("*l")
	return
end

-- The build module; once a build is loaded, you can find all the good stuff in here
local build = mainObject.main.modes["BUILD"]

-- Here's some helpful helper functions to help you get started
local function newBuild()
	mainObject.main:SetMode("BUILD", false, "Help, I'm stuck in Path of Building!")
	runCallback("OnFrame")
end
local function loadBuildFromXML(xmlText)
	mainObject.main:SetMode("BUILD", false, "", xmlText)
	runCallback("OnFrame")
end
local function loadBuildFromJSON(getItemsJSON, getPassiveSkillsJSON)
	mainObject.main:SetMode("BUILD", false, "")
	runCallback("OnFrame")
	local charData = build.importTab:ImportItemsAndSkills(getItemsJSON)
	build.importTab:ImportPassiveTreeAndJewels(getPassiveSkillsJSON, charData)
	-- You now have a build without a correct main skill selected, or any configuration options set
	-- Good luck!
end


-- Now you can mess around!

-- Probably optional
runCallback("OnExit")
