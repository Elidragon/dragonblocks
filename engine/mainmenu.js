/*
 * mainmenu.js
 *
 * Copyright 2020 Elias Fleckenstein <eliasfleckenstein@web.de>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301, USA.
 *
 *
 */

{
	document.title = dragonblocks.version.string;

	let mainmenu = document.body.insertBefore(document.createElement("div"), document.body.firstChild);
	mainmenu.style.visibility = "hidden";

	let center = mainmenu.appendChild(document.createElement("center"));

	let logo = center.appendChild(document.createElement("img"));
	logo.src = "textures/logo-mainmenu.png";

	let splash = mainmenu.appendChild(document.createElement("div"));
	splash.style.position = "fixed";
	splash.style.overflow = "hidden";
	splash.style.whiteSpace = "nowrap";
	splash.style.transform = "rotate(-15deg)";
	splash.style.color = "yellow";
	splash.style.fontSize = "30px";

	let status = center.appendChild(document.createElement("h1"));
	status.style.fontSize = "50px";
	status.style.display = "none";

	let content = center.appendChild(document.createElement("div"));
	content.id = "dragonblocks.mainmenu.content";
	content.style.position = "relative";
	content.style.top = "50px";

	let buttons = [];
	let onReload = [];

	let clearChildren = parent => {
		while (elem = parent.firstChild)
			elem.remove();
	};

	let worlds;

	// Load World Button

	{
		let loadWorldGUI, worldlistDisplay, noWorldsNotice;

		let worldProperties = new dragonblocks.World.Properties(true);

		if (dragonblocks.loggedin) {
			onReload.push(_ => {
				if (loadWorldGUI) {
					clearChildren(worldlistDisplay);
				} else {
					loadWorldGUI = new dragonblocks.gui.Box();

					let headline = loadWorldGUI.create("h1");
					headline.innerHTML = "Select World";
					headline.align = "center";

					noWorldsNotice = loadWorldGUI.create("center").appendChild(document.createElement("b"));

					worldlistDisplay = loadWorldGUI.create("ul");
				}

				noWorldsNotice.innerHTML = worlds.length == 0 ? "No Worlds" : "";

				for (let worldname in worlds) {
					let world = worlds[worldname];

					if (world.owned) {
						let worldDisplay = worldlistDisplay.appendChild(document.createElement("li"));
						worldDisplay.style.fontSize = "20px";
						worldDisplay.textContent = world.name;
						worldDisplay.style.postion = "relative";

						let button = worldDisplay.appendChild(document.createElement("button"));
						button.textContent = "Play";
						button.style.position = "absolute";
						button.style.right = "5px";
						button.style.fontSize = "12px";
						button.addEventListener("click", event => {
							event.srcElement.blur();
							loadWorldGUI.close();

							worldProperties.name = world.name;
							dragonblocks.start(worldProperties);
						});
					}
				}
			});
		}

		buttons.push({
			text: "Load Saved World",
			action: _ => {
				loadWorldGUI.open()
			},
			disabled: ! dragonblocks.loggedin,
		})
	}

	// Create World Button

	{
		let createWorldGUI = new dragonblocks.gui.Box();
		let createButton;

		let worldProperties = new dragonblocks.World.Properties(false);

		let headline = createWorldGUI.create("h1");
		headline.innerHTML = "New World";
		headline.align = "center";

		// Worldname
		createWorldGUI.create("h2").innerHTML = "&ensp;World Name";

		let worldnameInput = createWorldGUI.create("input");
		worldnameInput.type = "text";
		worldnameInput.style.position = "relative";
		worldnameInput.style.left = "40px";

		let worldnameAlert = createWorldGUI.create("b");
		worldnameAlert.style.position = "relative";
		worldnameAlert.style.left = "50px";

		worldnameInput.addEventListener("input", _ => {
			worldProperties.name = worldnameInput.value;

			if (! dragonblocks.loggedin) {
				worldnameAlert.textContent = "Warning: You are not logged in and cannot save worlds.";
				worldnameAlert.style.color = "#FF7D00";
				createButton.disabled = false;
			} else if (worldProperties.name == "") {
				worldnameAlert.textContent = "";
				createButton.disabled = true;
			} else if (! worldProperties.checkSpelling()) {
				worldnameAlert.textContent = "The world name contains forbidden characters";
				worldnameAlert.style.color = "#FF001F";
				createButton.disabled = true;
			} else if (worlds[worldProperties.name]) {
				if (worlds[worldProperties.name].owned) {
					worldnameAlert.textContent = "Warning: This will overwrite an existing world";
					worldnameAlert.style.color = "#FF7D00";
					createButton.disabled = false;
				} else {
					worldnameAlert.textContent = "This Worldname is taken";
					worldnameAlert.style.color = "#FF001F";
					createButton.disabled = true;
				}
			} else {
				worldnameAlert.textContent = "";
				createButton.disabled = false;
			}
		});

		// Mods
		createWorldGUI.create("h2").innerHTML = "&ensp;Mods";

		let modlistDisplay = createWorldGUI.create("ul");

		let updateModlist = _ => {
			clearChildren(modlistDisplay);

			let oldSelectedMods = worldProperties.mods;
			worldProperties.mods = {};

			for (let modname in dragonblocks.mods) {
				let modinfo = dragonblocks.mods[modname];

				let modDisplay = modlistDisplay.appendChild(document.createElement("li"));
				modDisplay.style.fontSize = "20px";
				modDisplay.innerHTML = modname;
				modDisplay.style.postion = "relative";
				modDisplay.title = modinfo.description;

				let checkbox = modDisplay.appendChild(document.createElement("input"));
				checkbox.type = "checkbox";
				checkbox.style.position = "absolute";
				checkbox.style.right = "5px";

				checkbox.addEventListener("input", _ => {
					worldProperties.mods[modname] = checkbox.checked;
				});

				worldProperties.mods[modname] = checkbox.checked = oldSelectedMods[modname];
			}
		};

		// Gamemode
		createWorldGUI.create("h2").innerHTML = "&ensp;Gamemode";

		for (let gamemode of ["survival", "creative"]){
			let radiobox = createWorldGUI.create("input");
			radiobox.name = "dragonblocks.mainmenu.createWorldGUI.gamemode";
			radiobox.type = "radio";
			radiobox.checked = gamemode == worldProperties.gamemode;
			radiobox.style.position = "relative";
			radiobox.style.left = "40px";

			radiobox.addEventListener("input", _ => {
				if (radiobox.checked)
					worldProperties.gamemode = gamemode;
			});

			let label = createWorldGUI.create("label");
			label.innerHTML = dblib.humanFormat(gamemode);
			label.style.position = "relative";
			label.style.left = "40px";
		}

		// Mapgen
		createWorldGUI.create("h2").innerHTML = "&ensp;Mapgen";

		let selectMapgen = createWorldGUI.create("select");
		selectMapgen.style.position = "relative";
		selectMapgen.style.left = "40px";
		selectMapgen.value = worldProperties.mapgen;

		selectMapgen.addEventListener("input", _ => {
			worldProperties.mapgen = selectMapgen.value;
		});

		for (let mapgen in dragonblocks.mapgen.list)
			selectMapgen.appendChild(document.createElement("option")).innerHTML = mapgen;

		createWorldGUI.create("br");
		createWorldGUI.create("br");

		// Create Button
		createButton = createWorldGUI.create("button");
		createButton.style.position = "absolute";
		createButton.style.left = "1%";
		createButton.style.bottom = "5px";
		createButton.style.width = "98%";
		createButton.style.fontSize = "20px";
		createButton.innerHTML = "Create World";

		createButton.addEventListener("click", event => {
			event.srcElement.blur();
			createWorldGUI.close();

			dragonblocks.start(worldProperties);
		});

		createWorldGUI.create("br");
		createWorldGUI.create("br");

		onReload.push(_ => {
			worldnameInput.value = "";
			worldnameAlert.textContent = "";
			createButton.disabled = dragonblocks.loggedin;

			updateModlist();
		});

		buttons.push({
			text: "Create New World",
			action: _ => {
				createWorldGUI.open();
			},
		});
	}

	// Credits Button

	{
		let creditsGUI = new dragonblocks.gui.Box();

		let pages = $.getJSON("credits.json").responseJSON;
		let page = 0;

		for (let dir of ["left", "right"]) {
			let arrow = creditsGUI.create("div");
			arrow.style.position = "absolute";
			arrow.style.width = "80px";
			arrow.style.height = "80px";
			arrow.style.position = "absolute";
			arrow.style[dir] = "3px";
			arrow.style.background = dragonblocks.getTexture("arrow.png");
			arrow.style.cursor = "pointer";

			if (dir == "right")
				arrow.style.transform = "rotate(180deg)";

			arrow.addEventListener("click", _ => {
				if (dir == "right")
					page++;
				else
					page--;

				creditsGUI.open();
			});

			dblib.centerVertical(arrow);
		}

		let creditsContent = creditsGUI.create("center");

		creditsGUI.addEventListener("open", _ => {
			if (page < 0)
				page = pages.length - 1;
			else if (page >= pages.length)
				page = 0;

			creditsContent.innerHTML = pages[page];
			dragonblocks.resolveTextures(creditsContent);

			// fix to center the dots of the li elements in chromium as well

			let lis = creditsContent.getElementsByTagName("li");

			for (let li of lis)
				li.style.width = "max-content";
		});

		buttons.push({
			text: "Credits",
			action: _ => {
				creditsGUI.open();
			},
		});
	}

	// Quit Button

	{
		buttons.push({
			text: "Quit",
			action: _ => {
				if (dragonblocks.isChromeApp)
					close();
				else
					history.back();
			},
		});
	}

	for (let {text, action, disabled} of buttons) {
		let button = content.appendChild(document.createElement("button"));
		button.style.fontSize = "40px";
		button.style.width = "100%";
		button.innerHTML = text;
		button.disabled = disabled;
		button.addEventListener("click", action);

		content.appendChild(document.createElement("br"));
		content.appendChild(document.createElement("br"));
	}

	for (let [side, text] of [["left", dragonblocks.version.string], ["right", dragonblocks.version.copyright]]) {
		let notice = content.appendChild(document.createElement("span"));
		notice.style.position = "fixed";
		notice.style.bottom = "5px";
		notice.style[side] = "5px";
		notice.innerHTML = text;
	}

	dragonblocks.enterMainMenu = _ => {
		dragonblocks.loadModList();
		worlds = dragonblocks.backendCall("getWorlds");

		content.style.display = "inherit";
		status.style.display = "none";

		for (let func of onReload)
			func();
	};

	dragonblocks.registerOnStart(_ => {
		content.style.display = "none";
		status.style.display = "inherit";

		status.innerHTML = "Loading...";
	});

	dragonblocks.registerOnStarted(_ => {
		mainmenu.style.visibility = "hidden";
	});

	dragonblocks.registerOnQuit(_ => {
		mainmenu.style.visibility = "visible";
		status.innerHTML = "Saving...";
	});

	let updateSplash = _ => {
		splash.style.left = (logo.x + logo.width - splash.clientWidth / 2) + "px";
		splash.style.top = (logo.y + logo.height / 3 * 2 - splash.clientHeight / 2) + "px";
	};

	let initMainMenu = _ => {
		document.body.style.backgroundColor = "skyblue";
		document.getElementById("elidragon").remove();
		content.style.width = logo.offsetWidth + "px";
		mainmenu.style.visibility = "visible";

		let splashes = $.getJSON("splashes.json").responseJSON;

		splash.innerHTML = splashes[Math.floor(Math.random() * splashes.length)];
		let fontSize = Math.min(parseInt(10000 / splash.clientWidth), 30);
		splash.style.fontSize = fontSize + "px";
		updateSplash();

		let counter = 0;
		setInterval(_ => {
			splash.style.fontSize = Math.sin(counter++ / 100 * Math.PI) * fontSize / 6 + fontSize + "px";
			updateSplash();
		});

		dragonblocks.enterMainMenu();
	};

	if (logo.complete)
		initMainMenu();
	else
		logo.addEventListener("load", initMainMenu);
}
