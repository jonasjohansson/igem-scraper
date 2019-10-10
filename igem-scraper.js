const rp = require('request-promise');
const csv = require('csv-parser');
const ObjectsToCsv = require('objects-to-csv');
const fs = require('fs');
const $ = require('cheerio');

const searchString = 'antibiotic';
const teamObjects = [];
const matches = [];

var maxResults = 5;
var count = 0;
var scrapeIndex = 0;

fs.createReadStream('0__team_list__2019-10-07.csv')
	.pipe(csv())
	.on('data', row => {
		var teamObject = {
			team: row[' Team  '],
			region: row[' Region '],
			country: row[' Country '],
			track: row[' Track '],
			status: row[' Status '],
			year: row[' Year']
		};
		teamObject.url = `https://${teamObject.year}.igem.org/Team:${teamObject.team}/Description`;
		if (teamObject.status === 'Accepted') {
			teamObjects.push(teamObject);
			// if (count++ < maxResults) teamObjects.push(teamObject);
		}
	})
	.on('end', () => {
		console.log('CSV file successfully processed');
		scrape(teamObjects[0]);
	});

function scrape(object) {
	console.log(scrapeIndex);
	rp(object.url)
		.then(function(html) {
			return $('p', html).text();
		})
		.then(function(text) {
			text = strip(text);
			object.text = text;
			// if (text.includes(searchString)) {
			matches.push(object);
			// }
		})
		.finally(function() {
			// if (scrapeIndex < maxResults - 1) {
			if (scrapeIndex < teamObjects.length - 1) {
				scrapeIndex++;
				scrape(teamObjects[scrapeIndex]);
			} else {
				console.log('Finally!');
				matches.sort(function(a, b) {
					return a.year - b.year;
				});
				// teamObjects.sort(function(a, b) {
				// 	return a.year - b.year;
				// });
				// for (var match of matches) {
				// 	console.log(match.url);
				// }
				// const csv = new ObjectsToCsv(teamObjects);
				const csv2 = new ObjectsToCsv(matches);
				// csv.toDisk('./allTeamObjects.csv');
				csv2.toDisk('./matches.csv');
			}
		});
}

function strip(str) {
	str = str.replace(/[^\w\s]/gi, '');
	str = str.replace(/[\r\n\t]+/gm, '');
	str = str.trim();
	str = str.toLowerCase();
	return str;
}
