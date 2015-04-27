var expect = require('chai').expect;
var visualDiff = require('./../main');
var newline = '\r\n';
describe('visualdiff-hscript', function () {
	it('is expected to mark inserted nodes', function (done) {
		var before = '<li>first item</li>' + 
		'<li>second item</li>';
		var after = '<li>first item</li>' + 
		'<li>second item</li>' + 
		'<li class="brand">third item</li>';

		var expected = '<li>first item</li>' + 
		'<li>second item</li>' + 
		'<li class="brand diff-added">third item</li>';

		visualDiff.getHtmlDiff(before, after)
			.then(function (result) {
				expect(expected).to.equal(result);
			})
			.then(function () {
				done();
			});
	});
	it('is expected to mark deleted nodes', function (done) {
		var before = '<li>first item</li>' + 
		'<li>second item</li>' + 
		'<li class="existing">third item</li>';
		var after = '<li>first item</li>' + 
		'<li>second item</li>';

		var expected = '<li>first item</li>' + 
		'<li>second item</li>' + 
		'<li class="existing diff-removed">third item</li>';
		visualDiff.getHtmlDiff(before, after)
			.then(function (result) {
				expect(expected).to.equal(result);
			})
			.then(function () {
				done();
			});
	});
	it('is expected to mark modified nodes', function (done) {
		var before = '<p>one <strong>two</strong> three.</p>';
		var after = '<p>one <em>two</em> three.</p>';

		var expected = '<p>one <em class="diff-changed">two</em> three.</p>';
		visualDiff.getHtmlDiff(before, after)
			.then(function (result) {
				expect(expected).to.equal(result);
			})
			.then(function () {
				done();
			});
	});
	it('is expected to display purely text diffs correctly', function (done) {
		var before = '<p>one three</p>';
		var after = '<p>one two three</p>';

		var expected = '<p><span>one </span><span class="diff-added">two </span><span>three</span></p>';
		visualDiff.getHtmlDiff(before, after)
			.then(function (result) {
				expect(expected).to.equal(result);
			})
			.then(function () {
				done();
			});
	});
});
