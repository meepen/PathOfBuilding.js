let fs = require( 'fs' );
let path = require( 'path' );

// TODO: this code violates the law
let walkSync = function(dir, filelist) {
  files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + file).isDirectory()) {
      filelist = walkSync(dir + file + '/', filelist);
    }
    else {
      filelist.push(dir + file);
    }
  });
  return filelist;
};

let fileData = Object.create(null);

walkSync("PathOfBuilding/").forEach(function(filePath) {
	let ext = path.extname(filePath);

	if (ext != ".lua" && ext != ".txt" && ext != ".xml" )
		return;

	fileData[filePath.replace(/^PathOfBuilding\//, '')] = fs.readFileSync(filePath, "utf8");
} );

fs.writeFileSync("filesystem.pach", JSON.stringify(fileData, null, '\t'));
