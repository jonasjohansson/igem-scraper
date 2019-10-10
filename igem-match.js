const rp = require('request-promise');
const csv = require('csv-parser');
const fs = require('fs');

fs.createReadStream('matches.csv')
	.pipe(csv())
	.on('data', row => {
		var teamObject = {
			team: row['team'],
			region: row['region'],
			country: row['country'],
			track: row['track'],
			status: row['status'],
			year: row['year'],
			url: row['url']
		};
		if (teamObject.year === '2016') {
			console.log(teamObject.url);
		}
	})
	.on('end', () => {
		console.log('CSV file successfully processed');
	});
