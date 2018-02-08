var http = require('http');
var fs = require('fs');

var file = fs.createWriteStream("./swagger.json");
var download = function (url, dest, cb) {
    var file = fs.createWriteStream(dest);
    var request = http.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(cb); // close() is async, call cb after close completes.
        });
    }).on('error', function (err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        if (cb) cb(err.message);
    });
};
download('http://localhost:3010/json', './swagger.json', () => {
    var CodeGen = require('swagger-typescript-codegen').CodeGen;
    var spec = './swagger.json';
    var swagger = JSON.parse(fs.readFileSync(spec, 'UTF-8'));
    var tsSourceCode = CodeGen.getTypescriptCode({
        className: 'Api',
        swagger: swagger,
        template: {
            class: fs.readFileSync('./templates/class.mustache', 'utf-8'),
            method: fs.readFileSync('./templates/method.mustache', 'utf-8'),
            type: fs.readFileSync('./templates/type.mustache', 'utf-8')
        },
        beautify: true,
        esnext: true
    });
    fs.writeFile('../client/rstart/app/src/api.ts', tsSourceCode, () => {
        console.log('done');
    });
});