import uploadFile from '../../helpers/fileUpload.js';
import team from './../../models/Team.js';

export const createTeam = async(req,res) => {
    try {
        const {name, type, players, numberOfMatches, wins, loses, draw, cleanSheets} = req.body;

        console.log('body', req.body)
        const logo = req.file

        if(!name || !type)  return res.status(400).send({success: false, message: 'Insufficient information'})

        if(type.toLowerCase()!='year'&&type.toLowerCase()!='branch'&&type.toLowerCase()!='college'&&type.toLowerCase()!='other'){
            return res.status(400).send({
                success: false,
                message: 'Invalid Team type'
            })
        }
        const teamExists = await team.findOne({name: name.toLowerCase()});

        if(teamExists){
            return res. status(400).send({
                success: false,
                message: 'Team already exists'
            })
        }

        const imageUrl = await uploadFile(logo,name);
        await team.create({
            name: name.toLowerCase(),
            type,
            players,
            numberOfMatches,
            wins,
            loses,
            draw,
            cleanSheets,
            logo: imageUrl
        })

        return res.status(200).send({
            success: true,
            message: 'Team created'
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

export const addPlayersInTeam = async(req,res) => {
    try {
        const id = req.params.id;

        const {players} = req.body;

        const Team = await team.findById(id);

        if(!Team){
            return res.status(404).send({
                success: false,
                message: 'Team not found'
            })
        }

        players.forEach(playerId => {
            if(!Team.players || !Team.players.includes(playerId)){
                Team.players.push(playerId)
            }
        });

        Team.save();
        return res.status(200).send({
            success: true,
            message: 'Players added successfully'
        })
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

export const getTeamDetails = async(req,res) => {
    try {
        const id = req.params.id;

        const teamDetails = await team.findById(id).populate('players');

        if(!teamDetails){
            return res.status(404).send({
                success: false,
                message: 'Team Not found'
            })
        }

        return res.status(200).send({
            success: true,
            message: 'Team details fetched successfully',
            teamDetails
        })
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

export const getAllTeamsList = async(req,res) => {
    try {
        const teamsList = await team.find({}).populate('players')

        return res.status(200).send({
            success: true,
            teamsList
        })

    } catch (error) {
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

export const deleteTeam = async(req,res) => {
    try {
        const id = req.params.id;

        const Team = await team.findByIdAndDelete(id);


        return res.status(200).send({
            success: true,
            message: 'Team Deleted successfully'
        })
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

export const updateTeamDetails = async(req,res) => {
    try {
        const id = req.params.id;

        const image = req.file;

        const {name, type, players, numberOfMatches, wins, loses, draw, cleanSheets, logo} = req.body

        const Team = await team.findById(id);

        if(!Team){
            return res.status(404).send({
                success: false,
                message: 'Team Not found'
            })
        }

        if(name)    Team.name = name
        if(type)    Team.type = type;
        if(players) Team.players = players;
        if(numberOfMatches) Team.numberOfMatches = numberOfMatches;
        if(wins)    Team.wins = wins;
        if(loses)   Team.loses = loses;
        if(draw)    Team.draw = draw;
        if(cleanSheets) Team.cleanSheets = cleanSheets;
        if(logo)    Team.logo = logo;

        console.log(image)
        const imageUrl = await uploadFile(image);

        if(imageUrl)    Team.logo = imageUrl;

        if(!logo&&!image)   Team.logo = null;
        await Team.save();

        return res.status(200).send({
            success: true,
            message: 'Team Details Updated'
        })
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

export const getPlayersOfTeam = async(req,res) => {
    try {
        const {id} = req.params

        if(!id) return res.status(404).send({
            success: false,
            message: 'Team Id not found'
        })

        const Team = await team.findById(id).populate('players');

        if(!Team)   return res.status(404).send({
            success: false,
            message: "Team Not found"
        })

        return res.status(200).send({
            success: true,
            players: Team.players
        })

    } catch (error) {
        console.log(error)
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error'
        })
    }
}