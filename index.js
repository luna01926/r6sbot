
var req = require('request');
const Discord = require('discord.js');
const settings = require('./settings')
const client = new Discord.Client();

var headers = {
	'Content-Type' : 'application/json'
}
const endpoint = 'https://api.r6stats.com/api/v1';

client.on('ready', ()=>{
	console.log('ready?');
});

client.on('message', msg =>{
	// test command -> show user K/D
	if(msg.content.startsWith(settings.command_prefix + 'kd')){
		let s = msg.content.split(' ');
		let gamemode = 'all';
		let username = s[1];
		if(s.length > 2){
			if(s[2] === 'rank'){
				gamemode = 'ranked';
			}
			else if(s[2] === 'casual'){
				gamemode = 'casual';
			}
			else{
				msg.channel.send('構文間違ってるぞ');
				return;
			}
		}
		let data = {};
		var options = {
			url: endpoint + '/players/' + username,
			method: 'GET',
			headers: headers,
			json: true,
			form:{'platform':'uplay'}
		}

		req(options, (err, res, body)=>{
			if('status' in body){
				msg.channel.send('そんなユーザおらんで');
				return;
			}
			data = body['player']['stats'];
			if(gamemode === 'all'){
				kd = (data['ranked']['kills'] + data['casual']['kills']) / (data['ranked']['deaths'] + data['casual']['deaths']) * 1000;
				kd = Math.round(kd) / 1000;
				msg.channel.send('```K/D : ' + kd + '```');
			}else{
				msg.channel.send('```K/D : ' + data[gamemode]['kd'] + '```');
			}
		});
	}

	// show userdata
	if(msg.content.startsWith(settings.command_prefix + 'r6s')){
		let s = msg.content.split(' ');
		let username = s[1];

		var options = {
			url: endpoint + '/players/' + username,
			method: 'GET',
			headers: headers,
			json: true,
			form:{'platform':'uplay'}
		}

		// request userdata
		req(options, (err, res, body)=>{
			if('status' in body){
				//if(body['status'] === 'failed'){
					msg.channel.send('そんなユーザおらんで');
					return;
				//}
			}
			data = body['player']['stats'];
			
			user_data = {};
			user_data['wins'] = data['ranked']['wins'] + data['casual']['wins'];
			user_data['losses'] = data['ranked']['losses'] + data['casual']['losses'];
			user_data['wlr'] = Math.round(user_data['wins'] / user_data['losses']*1000)/1000;
			user_data['kills'] = data['ranked']['kills'] + data['casual']['kills'];
			user_data['deaths'] = data['ranked']['deaths'] + data['casual']['deaths'];
			user_data['kd'] = Math.round(user_data['kills'] / user_data['deaths']*1000)/1000;
			let t = data['ranked']['playtime'] + data['casual']['playtime'];
			let h = Math.floor(t/3600);
			t %= 3600;
			let m = Math.floor(t/60);
			t %= 60;
			let s = t;
			user_data['playtime'] = h.toString() + '時間' + m.toString() + '分' + s.toString() + '秒';
			user_data['level'] = data['progression']['level'];
			user_data['melee_kills'] = data['overall']['melee_kills'];

			msg.channel.send('```\n'+username+
				'\n勝利数\t\t:\t'+user_data['wins']+
				'\n敗北数\t\t:\t'+user_data['losses']+
				'\nW/L\t\t\t:\t'+user_data['wlr']+
				'\nキル数\t\t:\t'+user_data['kills']+
				'\nデス数\t\t:\t'+user_data['deaths']+
				'\nK/D\t\t\t:\t'+user_data['kd']+
				'\n近接キル数\t:\t'+user_data['melee_kills']+
				'\nプレイ時間\t:\t'+user_data['playtime']+
				'\nレベル\t\t:\t'+user_data['level']+'```');
		});
	}
});

client.login(settings.token);

