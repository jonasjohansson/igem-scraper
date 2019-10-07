const rp = require('request-promise');
const csv = require('csv-parser');
const fs = require('fs');
const $ = require('cheerio');

const searchString = 'sulfur';
const teamObjects = [];
const matches = [];

var maxResults = 100;
var i = 0;

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
			if (i++ <= maxResults) teamObjects.push(teamObject);
		}
	})
	.on('end', () => {
		for (let teamObject of teamObjects) {
			rp(teamObject.url)
				.then(function(html) {
					return $('p', html)
						.text()
						.toLowerCase();
				})
				.then(function(text) {
					if (text.includes(searchString)) {
						matches.push(teamObject);
						console.log(teamObject.url);
					}
				})
				.catch(function(err) {});
		}
		console.log('CSV file successfully processed');
	});
