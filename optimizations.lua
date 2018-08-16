local PassiveTreeViewClass = common.classes.PassiveTreeView

local m_min = math.min

local launch, main

local pairs = pairs
local ipairs = ipairs
local t_insert = table.insert
local t_remove = table.remove
local m_min = math.min
local m_max = math.max
local m_floor = math.floor

for i = 0, debug.getinfo(PassiveTreeViewClass.Draw).nups - 1 do
    local name, val = debug.getupvalue(PassiveTreeViewClass.Draw, i)
    if (name == "launch") then
        launch = val
    elseif (name == "main") then
        main = val
    end
end

local OverlayTypeIgnore = {
    ClassStart = true,
    AscendClassStart = true
}

function PassiveTreeViewClass:Draw(build, viewPort, inputEvents)
    local OverlayTypeIgnore = OverlayTypeIgnore

	local tree = build.tree
	local spec = build.spec

	local cursorX, cursorY = GetCursorPos()
	local mOver = cursorX >= viewPort.x and cursorX < viewPort.x + viewPort.width and cursorY >= viewPort.y and cursorY < viewPort.y + viewPort.height

	-- Process input events
	local treeClick
	for id, event in ipairs(inputEvents) do
		if event.type == "KeyDown" then
			if event.key == "LEFTBUTTON" then
				if mOver then
					-- Record starting coords of mouse drag
					-- Dragging won't actually commence unless the cursor moves far enough
					self.dragX, self.dragY = cursorX, cursorY
				end
			elseif event.key == "p" then
				self.showHeatMap = not self.showHeatMap
			elseif event.key == "d" and IsKeyDown("CTRL") then
				self.showStatDifferences = not self.showStatDifferences
			elseif event.key == "PAGEUP" then
				self:Zoom(IsKeyDown("SHIFT") and 3 or 1, viewPort)
			elseif event.key == "PAGEDOWN" then
				self:Zoom(IsKeyDown("SHIFT") and -3 or -1, viewPort)
			end
		elseif event.type == "KeyUp" then
			if event.key == "LEFTBUTTON" then
				if self.dragX and not self.dragging then
					-- Mouse button went down, but didn't move far enough to trigger drag, so register a normal click
					treeClick = "LEFT"
				end
			elseif mOver then
				if event.key == "RIGHTBUTTON" then
					treeClick = "RIGHT"
				elseif event.key == "WHEELUP" then
					self:Zoom(IsKeyDown("SHIFT") and 3 or 1, viewPort)
				elseif event.key == "WHEELDOWN" then
					self:Zoom(IsKeyDown("SHIFT") and -3 or -1, viewPort)
				end	
			end
		end
	end

	if not IsKeyDown("LEFTBUTTON") then
		-- Left mouse button isn't down, stop dragging if dragging was in progress
		self.dragging = false
		self.dragX, self.dragY = nil, nil
	end
	if self.dragX then
		-- Left mouse is down
		if not self.dragging then
			-- Check if mouse has moved more than a few pixels, and if so, initiate dragging
			if math.abs(cursorX - self.dragX) > 5 or math.abs(cursorY - self.dragY) > 5 then
				self.dragging = true
			end
		end
		if self.dragging then
			self.zoomX = self.zoomX + cursorX - self.dragX
			self.zoomY = self.zoomY + cursorY - self.dragY
			self.dragX, self.dragY = cursorX, cursorY
		end
	end
	
	-- Ctrl-click to zoom
	if treeClick and IsKeyDown("CTRL") then
		self:Zoom(treeClick == "RIGHT" and -2 or 2, viewPort)
		treeClick = nil
	end

	-- Create functions that will convert coordinates between the screen and tree coordinate spaces
	local scale = m_min(viewPort.width, viewPort.height) / tree.size * self.zoom
	local offsetX = self.zoomX + viewPort.x + viewPort.width/2
	local offsetY = self.zoomY + viewPort.y + viewPort.height/2
	local function treeToScreen(x, y)
		return x * scale + offsetX,
		       y * scale + offsetY
	end
	local function screenToTree(x, y)
		return (x - offsetX) / scale,
		       (y - offsetY) / scale
	end

	if IsKeyDown("SHIFT") then
		-- Enable path tracing mode
		self.traceMode = true
		self.tracePath = self.tracePath or { }
	else
		self.traceMode = false
		self.tracePath = nil
	end

	local hoverNode
	if mOver then
		-- Cursor is over the tree, check if it is over a node
		local curTreeX, curTreeY = screenToTree(cursorX, cursorY)
		for nodeId, node in pairs(spec.nodes) do
			if node.rsq then
				-- Node has a defined size (i.e has artwork)
				local vX = curTreeX - node.x
				local vY = curTreeY - node.y
				if vX * vX + vY * vY <= node.rsq then
					hoverNode = node
					break
				end
			end
		end
	end

	-- If hovering over a node, find the path to it (if unallocated) or the list of dependant nodes (if allocated)
	local hoverPath, hoverDep
	if self.traceMode then
		-- Path tracing mode is enabled
		if hoverNode then
			if not hoverNode.path then
				-- Don't highlight the node if it can't be pathed to
				hoverNode = nil
			elseif not self.tracePath[1] then
				-- Initialise the trace path using this node's path
				for _, pathNode in ipairs(hoverNode.path) do
					t_insert(self.tracePath, 1, pathNode)
				end
			else
				local lastPathNode = self.tracePath[#self.tracePath]
				if hoverNode ~= lastPathNode then
					-- If node is directly linked to the last node in the path, add it
					if isValueInArray(hoverNode.linked, lastPathNode) then
						local index = isValueInArray(self.tracePath, hoverNode)
						if index then
							-- Node is already in the trace path, remove it first
							t_remove(self.tracePath, index)
						end
						t_insert(self.tracePath, hoverNode)	
					else
						hoverNode = nil
					end
				end
			end
		end
		-- Use the trace path as the path 
		hoverPath = { }
		for _, pathNode in pairs(self.tracePath) do
			hoverPath[pathNode] = true
		end
	elseif hoverNode and hoverNode.path then
		-- Use the node's own path and dependance list
		hoverPath = { }
		if not hoverNode.dependsOnIntuitiveLeap then
			for _, pathNode in pairs(hoverNode.path) do
				hoverPath[pathNode] = true
			end
		end
		hoverDep = { }
		for _, depNode in pairs(hoverNode.depends) do
			hoverDep[depNode] = true
		end
	end

	if treeClick == "LEFT" then
		if hoverNode then
			-- User left-clicked on a node
			if hoverNode.alloc then
				-- Node is allocated, so deallocate it
				spec:DeallocNode(hoverNode)
				spec:AddUndoState()
				build.buildFlag = true
			elseif hoverNode.path then
				-- Node is unallocated and can be allocated, so allocate it
				spec:AllocNode(hoverNode, self.tracePath and hoverNode == self.tracePath[#self.tracePath] and self.tracePath)
				spec:AddUndoState()
				build.buildFlag = true
			end
		end
	elseif treeClick == "RIGHT" then
		if hoverNode and hoverNode.alloc and hoverNode.type == "Socket" then
			local slot = build.itemsTab.sockets[hoverNode.id]
			if slot:IsEnabled() then
				-- User right-clicked a jewel socket, jump to the item page and focus the corresponding item slot control
				slot.dropped = true
				build.itemsTab:SelectControl(slot)
				build.viewMode = "ITEMS"
			end
		end
	end

	-- Draw the background artwork
	local bg = tree.assets.Background1
	if bg.width == 0 then
		bg.width, bg.height = bg.handle:ImageSize()
	end
	if bg.width > 0 then
		local bgSize = bg.width * scale * 1.33 * 2.5
		SetDrawColor(1, 1, 1)
		DrawImage(bg.handle, viewPort.x, viewPort.y, viewPort.width, viewPort.height, (self.zoomX + viewPort.width/2) / -bgSize, (self.zoomY + viewPort.height/2) / -bgSize, (viewPort.width/2 - self.zoomX) / bgSize, (viewPort.height/2 - self.zoomY) / bgSize)
	end

	-- Hack to draw class background art, the position data doesn't seem to be in the tree JSON yet
	if build.spec.curClassId == 1 then
		local scrX, scrY = treeToScreen(-2750, 1600)
		self:DrawAsset(tree.assets.BackgroundStr, scrX, scrY, scale)
	elseif build.spec.curClassId == 2 then
		local scrX, scrY = treeToScreen(2550, 1600)
		self:DrawAsset(tree.assets.BackgroundDex, scrX, scrY, scale)
	elseif build.spec.curClassId == 3 then
		local scrX, scrY = treeToScreen(-250, -2200)
		self:DrawAsset(tree.assets.BackgroundInt, scrX, scrY, scale)
	elseif build.spec.curClassId == 4 then
		local scrX, scrY = treeToScreen(-150, 2350)
		self:DrawAsset(tree.assets.BackgroundStrDex, scrX, scrY, scale)
	elseif build.spec.curClassId == 5 then
		local scrX, scrY = treeToScreen(-2100, -1500)
		self:DrawAsset(tree.assets.BackgroundStrInt, scrX, scrY, scale)
	elseif build.spec.curClassId == 6 then
		local scrX, scrY = treeToScreen(2350, -1950)
		self:DrawAsset(tree.assets.BackgroundDexInt, scrX, scrY, scale)
	end

	-- Draw the group backgrounds
	for _, group in pairs(tree.groups) do
		local scrX, scrY = treeToScreen(group.x, group.y)
		if group.ascendancyName then
			if group.isAscendancyStart then
				if group.ascendancyName ~= spec.curAscendClassName then
					SetDrawColor(1, 1, 1, 0.25)
				end
				self:DrawAsset(tree.assets["Classes"..group.ascendancyName], scrX, scrY, scale)
				SetDrawColor(1, 1, 1)
			end
		elseif group.oo[3] then
			self:DrawAsset(tree.assets.PSGroupBackground3, scrX, scrY, scale, true)
		elseif group.oo[2] then
			self:DrawAsset(tree.assets.PSGroupBackground2, scrX, scrY, scale)
		elseif group.oo[1] then
			self:DrawAsset(tree.assets.PSGroupBackground1, scrX, scrY, scale)
		end
	end

	-- Draw the connecting lines between nodes
	SetDrawLayer(nil, 20)
	for _, connector in pairs(tree.connectors) do
		local node1, node2 = spec.nodes[connector.nodeId1], spec.nodes[connector.nodeId2]

		-- Determine the connector state
		local state = "Normal"
		if node1.alloc and node2.alloc then	
			state = "Active"
		elseif hoverPath then
			if (node1.alloc or node1 == hoverNode or hoverPath[node1]) and (node2.alloc or node2 == hoverNode or hoverPath[node2]) then
				state = "Intermediate"
			end
		end

		-- Convert vertex coordinates to screen-space and add them to the coordinate array
		local vert = connector.vert[state]

		if hoverDep and hoverDep[node1] and hoverDep[node2] then
			-- Both nodes depend on the node currently being hovered over, so color the line red
			SetDrawColor(1, 0, 0)
		elseif connector.ascendancyName and connector.ascendancyName ~= spec.curAscendClassName then
			-- Fade out lines in ascendancy classes other than the current one
			SetDrawColor(0.75, 0.75, 0.75)
		end

        local c = connector.c
		DrawImageQuad(tree.assets[connector.type..state].handle, 
            vert[1] * scale + offsetX, vert[2] * scale + offsetY,
            vert[3] * scale + offsetX, vert[4] * scale + offsetY,
            vert[5] * scale + offsetX, vert[6] * scale + offsetY,
            vert[7] * scale + offsetX, vert[8] * scale + offsetY,
            c[9], c[10],
            c[11], c[12],
            c[13], c[14],
            c[15], c[16]
        )
		SetDrawColor(1, 1, 1)
	end

	if self.showHeatMap then
		-- Build the power numbers if needed
		build.calcsTab:BuildPower()
	end

	-- Update cached node data
	if self.searchStrCached ~= self.searchStr then
		self.searchStrCached = self.searchStr
		for nodeId, node in pairs(spec.nodes) do
			self.searchStrResults[nodeId] = #self.searchStr > 0 and self:DoesNodeMatchSearchStr(node)
		end
	end

	-- Draw the nodes
	for nodeId, node in pairs(spec.nodes) do
		-- Determine the base and overlay images for this node based on type and state
		local base, overlay
		SetDrawLayer(nil, 25)
		if node.type == "ClassStart" then
			overlay = node.alloc and node.startArt or "PSStartNodeBackgroundInactive"
		elseif node.type == "AscendClassStart" then
			overlay = "PassiveSkillScreenAscendancyMiddle"
		elseif node.type == "Mastery" then
			-- This is the icon that appears in the center of many groups
			SetDrawLayer(nil, 15)
			base = node.sprites.mastery
		else
			local state
			if self.showHeatMap or node.alloc or node == hoverNode or (self.traceMode and node == self.tracePath[#self.tracePath])then
				-- Show node as allocated if it is being hovered over
				-- Also if the heat map is turned on (makes the nodes more visible)
				state = "alloc"
			elseif hoverPath and hoverPath[node] then
				state = "path"
			else
				state = "unalloc"
			end
			if node.type == "Socket" then
				-- Node is a jewel socket, retrieve the socketed jewel (if present) so we can display the correct art
				base = tree.assets[node.overlay[state]]
				local socket, jewel = build.itemsTab:GetSocketAndJewelForNodeID(nodeId)
				if node.alloc and jewel then
					if jewel.baseName == "Crimson Jewel" then
						overlay = "JewelSocketActiveRed"
					elseif jewel.baseName == "Viridian Jewel" then
						overlay = "JewelSocketActiveGreen"
					elseif jewel.baseName == "Cobalt Jewel" then
						overlay = "JewelSocketActiveBlue"
					elseif jewel.baseName == "Prismatic Jewel" then
						overlay = "JewelSocketActivePrismatic"
					elseif jewel.baseName:match("Eye Jewel$") then
						overlay = "JewelSocketActiveAbyss"
					end
				end
			else
				-- Normal node (includes keystones and notables)
				base = node.sprites[node.type:lower()..(node.alloc and "Active" or "Inactive")] 
				overlay = node.overlay[state .. (node.ascendancyName and "Ascend" or "")]
			end
		end

		-- Convert node position to screen-space
		local scrX, scrY = node.x * scale + offsetX,
		       node.y * scale + offsetY
	
		-- Determine color for the base artwork
		if node.ascendancyName and node.ascendancyName ~= spec.curAscendClassName then
			-- By default, fade out nodes from ascendancy classes other than the current one
			SetDrawColor(0.5, 0.5, 0.5)
		end
		if self.showHeatMap then
			if not node.alloc and node.type ~= "ClassStart" and node.type ~= "AscendClassStart" then
				-- Calculate color based on DPS and defensive powers
				local offence = m_max(node.power.offence or 0, 0)
				local defence = m_max(node.power.defence or 0, 0)
				local dpsCol = (offence / build.calcsTab.powerMax.offence * 1.5) ^ 0.5
				local defCol = (defence / build.calcsTab.powerMax.defence * 1.5) ^ 0.5
				local mixCol = (m_max(dpsCol - 0.5, 0) + m_max(defCol - 0.5, 0)) / 2
				if main.nodePowerTheme == "RED/BLUE" then
					SetDrawColor(dpsCol, mixCol, defCol)
				elseif main.nodePowerTheme == "RED/GREEN" then
					SetDrawColor(dpsCol, defCol, mixCol)
				elseif main.nodePowerTheme == "GREEN/BLUE" then
					SetDrawColor(mixCol, dpsCol, defCol)
				end
			else
				SetDrawColor(1, 1, 1)
			end
		elseif launch.devModeAlt then
			-- Debug display
			if node.extra then
				SetDrawColor(1, 0, 0)
			elseif node.unknown then
				SetDrawColor(0, 1, 1)
			else
				SetDrawColor(0, 0, 0)
			end
		else
			SetDrawColor(1, 1, 1)
		end
		
		-- Draw base artwork
		if base then
			self:DrawAsset(base, scrX, scrY, scale)
		end

		if overlay then
			-- Draw overlay
			if not OverlayTypeIgnore[node.type] then
				if hoverNode and hoverNode ~= node then
					-- Mouse is hovering over a different node
					if hoverDep and hoverDep[node] then
						-- This node depends on the hover node, turn it red
						SetDrawColor(1, 0, 0)
					elseif hoverNode.type == "Socket" then
						-- Hover node is a socket, check if this node falls within its radius and color it accordingly
						for index, data in ipairs(build.data.jewelRadius) do
							if hoverNode.nodesInRadius[index][node.id] then
								SetDrawColor(data.col)
								break
							end
						end
					end
				end
			end
			self:DrawAsset(tree.assets[overlay], scrX, scrY, scale)
			SetDrawColor(1, 1, 1)
		end
		if self.searchStrResults[nodeId] then
			-- Node matches the search string, show the highlight circle
			SetDrawLayer(nil, 30)
			SetDrawColor(1, 0, 0)
			local size = 175 * scale / self.zoom ^ 0.4
			DrawImage(self.highlightRing, scrX - size, scrY - size, size * 2, size * 2)
		end
		if node == hoverNode and (node.type ~= "Socket" or not IsKeyDown("SHIFT")) and not main.popups[1] then
			-- Draw tooltip
			SetDrawLayer(nil, 100)
			local size = m_floor(node.size * scale)
			if self.tooltip:CheckForUpdate(node, self.showStatDifferences, self.tracePath, launch.devModeAlt, build.outputRevision) then
				self:AddNodeTooltip(self.tooltip, node, build)
			end
			self.tooltip:Draw(m_floor(scrX - size), m_floor(scrY - size), size * 2, size * 2, viewPort)
		end
	end

	-- Draw ring overlays for jewel sockets
	SetDrawLayer(nil, 25)
	for nodeId, slot in pairs(build.itemsTab.sockets) do
		local node = spec.nodes[nodeId]
		if node == hoverNode then
			-- Mouse is over this socket, show all radius rings
			local scrX, scrY = treeToScreen(node.x, node.y)
			for _, radData in ipairs(build.data.jewelRadius) do
				local size = radData.rad * scale
				SetDrawColor(radData.col)
				DrawImage(self.ring, scrX - size, scrY - size, size * 2, size * 2)
			end
		elseif node.alloc then
			local socket, jewel = build.itemsTab:GetSocketAndJewelForNodeID(nodeId)
			if jewel and jewel.jewelRadiusIndex then
				-- Socket is allocated and there's a jewel socketed into it which has a radius, so show it
				local scrX, scrY = treeToScreen(node.x, node.y)
				local radData = build.data.jewelRadius[jewel.jewelRadiusIndex]
				local size = radData.rad * scale
				SetDrawColor(radData.col)
				DrawImage(self.ring, scrX - size, scrY - size, size * 2, size * 2)				
			end
		end
	end
end

function PassiveTreeViewClass:DrawAsset(data, x, y, scale, isHalf)
    local width = data.width
	if width == 0 then
		width, data.height = data.handle:ImageSize()
        data.width = width
		if data.width == 0 then
			return
		end
	end

	width = width * scale * 1.33
	local height = data.height * scale * 1.33
	if isHalf then
		DrawImage(data.handle, x - width, y - height * 2, width * 2, height * 2)
		DrawImage(data.handle, x - width, y, width * 2, height * 2, 0, 1, 1, 0)
	elseif data[1] then
		DrawImage(data.handle, x - width, y - height, width * 2, height * 2, data[1], data[2], data[3], data[4])
    else
		DrawImage(data.handle, x - width, y - height, width * 2, height * 2)
	end
end