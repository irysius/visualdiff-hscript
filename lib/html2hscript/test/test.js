var parser = require('./../index');
parser('<p>a&nbsp;<strong>b</strong> c</p>', function (e, script) {
	console.log(script);
});