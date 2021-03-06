var expect = require('chai').expect;
var visualDiff = require('./../main');
var Promise = require('bluebird');
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
	it('is expected to mark inserted text', function (done) {
		var before = '<p></p>';
		var after = '<p>first item</p>';

		var expected = '<p><span class="diff-added">first item</span></p>';

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
	it('is expected to mark removed text', function (done) {
		var before = '<p>first item</p>';
		var after = '<p></p>';

		var expected = '<p><span class="diff-removed">first item</span></p>';
		visualDiff.getHtmlDiff(before, after)
			.then(function (result) {
				expect(expected).to.equal(result);
			})
			.then(function () {
				done();
			});
	});
	it('is expected to mark modified nodes', function (done) {
		var before1 = '<p>one <strong>two</strong> three.</p>';
		var after1 = '<p>one <em>two</em> three.</p>';

		var expected1 = '<p>one <em class="diff-changed">two</em> three.</p>';

		var before2 = '<p><strong>bolded text</strong></p>';
		var after2 = '<p>bolded text</p>';

		var expected2 = '<p><span class="diff-changed">bolded text</span></p>';
		Promise.all([visualDiff.getHtmlDiff(before1, after1), visualDiff.getHtmlDiff(before2, after2)])
			.spread(function (result1, result2) {
				expect(expected1).to.equal(result1);
				expect(expected2).to.equal(result2);
			})
			.then(function () {
				done();
			});
	});
	it('is expected to display purely text diffs correctly', function (done) {
		var before1 = '<p>one three</p>';
		var after1 = '<p>one two three</p>';

		var expected1 = '<p><span>one </span><span class="diff-added">two </span><span>three</span></p>';

		var before2 = '<p>one two three</p>';
		var after2 = '<p>one three</p>';

		var expected2 = '<p><span>one </span><span class="diff-removed">two </span><span>three</span></p>';
		
		var before3 = '<p>Today help for course work is more accessible than ever before.</p>';
		var after3 = '<p>Today, help for course work is more accessible than ever before.</p>';
		
		var expected3 = '<p><span>Today</span><span class="diff-added">,</span><span> help for course work is more accessible than ever before.</span></p>';
		Promise.all([
			visualDiff.getHtmlDiff(before1, after1), 
			visualDiff.getHtmlDiff(before2, after2),
			visualDiff.getHtmlDiff(before3, after3)])
			.spread(function (result1, result2, result3) {
				expect(expected1).to.equal(result1);
				expect(expected2).to.equal(result2);
				expect(expected3).to.equal(result3);
			})
			.then(function () {
				done();
			});
	});
	it('is expected to work with the following case', function (done) {
		var before = '<p>one two three <a href="#">four five</a> six seven eight nine</p>';
		var after = '<p>one <em>two</em> three <a href="#">four five</a> six <strong>seven eight</strong> nine</p>';
		
		var expected = '<p><span>one </span><em class="diff-changed">two</em><span class="diff-added"> three </span><a href="#" class="diff-added">four five</a><span class="diff-added"> six </span><strong class="diff-added">seven eight</strong><span class="diff-added"> nine</span></p>';
		visualDiff.getHtmlDiff(before, after)
			.then(function (result) {
				expect(expected).to.equal(result);
			})
			.then(function () {
				done();
			});
	});
});