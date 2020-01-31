const fs = require("fs")

function readFile() {
	let sufix = ""
	fs.readFile("./src/JSON/ignite.json", "utf-8", (error, data) => {
		if (error) return
		const json = JSON.parse(data)
		sufix = json.ignite
	})

	return sufix
}

function writeFile(data) {
	fs.writeFile("./src/JSON/ignite.json", JSON.stringify(data), error => {
		if (error) return
	})
}

module.exports = {
	readFile,
	writeFile
}
