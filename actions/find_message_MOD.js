module.exports = {
	name: "Find Message",
	section: "Messaging",

	subtitle: function(data) {
		const channels = ["Same Channel", "Mentioned Channel", "1st Server Channel", "Temp Variable", "Server Variable", "Global Variable"];
		const info = ["Find by Content", "Find by ID"];
		return `${channels[parseInt(data.channel)]} - ${info[parseInt(data.info)]}`;
	},

	variableStorage: function(data, varType) {
		const type = parseInt(data.storage);
		if(type !== varType) return;
		const info = parseInt(data.info);
		let dataType = "Message";
		return ([data.varName2, dataType]);
	},

	fields: ["channel", "varName", "info", "search", "storage", "varName2"],

	html: function(isEvent, data) {
		return `
<div id ="wrexdiv" style="width: 550px; height: 350px; overflow-y: scroll;">
<div>
	<div style="float: left; width: 35%;">
		Source Channel:<br>
		<select id="channel" class="round" onchange="glob.channelChange(this, 'varNameContainer')">
			${data.channels[isEvent ? 1 : 0]}
		</select>
	</div>
	<div id="varNameContainer" style="display: none; float: right; width: 60%;">
		Variable Name:<br>
		<input id="varName" class="round" type="text" list="variableList"><br>
	</div>
</div><br><br><br>
<div>
	<div style="float: left; width: 70%;">
		Find by:<br>
		<select id="info" class="round">
			<option value="0" selected>Find by Content</option>
			<option value="1">Find by ID</option>
		</select>
	</div><br><br><br>
	<div style="float: left; width: 70%;">
		Search for:<br>
		<input id="search" class="round" type="text"><br>
	</div>
</div><br>
<div>
	<div style="float: left; width: 35%;">
		Store In:<br>
		<select id="storage" class="round">
			${data.variables[1]}
		</select>
	</div>
	<div id="varNameContainer2" style="float: right; width: 60%;">
		Variable Name:<br>
		<input id="varName2" class="round" type="text"><br>
	</div>
</div><br><br><br>
<div>
	<p>
	<u>Note:</u><br>
	This mod can only find messages by <b>content</b> within the last 100 messages.<br>
	If there are multiple messages with the same content, the bot is always using the oldest message (after start).
</div>`;
	},

	init: function() {
		const { glob, document } = this;

		glob.channelChange(document.getElementById("channel"), "varNameContainer");
	},

	action: function(cache) {
		const data = cache.actions[cache.index];
		const channel = parseInt(data.channel);
		const varName = this.evalMessage(data.varName, cache);
		const info = parseInt(data.info);
		const search = this.evalMessage(data.search, cache);
		const targetChannel = this.getChannel(channel, varName, cache);
		if(!targetChannel) {
			this.callNextAction(cache);
			return;
		}

		const storage = parseInt(data.storage);
		const varName2 = this.evalMessage(data.varName2, cache);

		let result;
		switch(info) {
			case 0:
				targetChannel.fetchMessages({ limit: 100 }).then((messages) =>{
					const message = messages.find((el) => el.content.includes(search));
					if(message !== undefined){
						this.storeValue(message, storage, varName2, cache);
					}
					this.callNextAction(cache);
				}).catch((err)=>{
					console.error(err);
					this.callNextAction(cache);
				});
				break;
			case 1:
				targetChannel.fetchMessage(search).then((message) =>{
					if(message !== undefined){
						this.storeValue(message, storage, varName2, cache);
					}
					this.callNextAction(cache);
				}).catch((err)=>{
					console.error(err);
					this.callNextAction(cache);
				});
				break;
			default:
				break;
		}
	},

	mod: function() {}
};
