import uploadFile from "../../helpers/fileUpload.js";
import { calculatePlayerStats } from "../../helpers/playerStats.js";
import latestTournament from "../../models/LatestTournament.js";
import match from "../../models/Match.js";
import tournament from "../../models/Tournament.js";
import team from "./../../models/Team.js";

export const createTeam = async (req, res) => {
  try {
    const {
      name,
      type,
      players,
      numberOfMatches,
      wins,
      loses,
      draw,
      cleanSheets,
    } = req.body;

    console.log("body", req.body);
    const logo = req.file;

    if (!name || !type)
      return res
        .status(400)
        .send({ success: false, message: "Insufficient information" });

    if (
      type.toLowerCase() != "year" &&
      type.toLowerCase() != "branch" &&
      type.toLowerCase() != "college" &&
      type.toLowerCase() != "other"
    ) {
      return res.status(400).send({
        success: false,
        message: "Invalid Team type",
      });
    }
    const teamExists = await team.findOne({ name: name.toLowerCase() });

    if (teamExists) {
      return res.status(400).send({
        success: false,
        message: "Team already exists",
      });
    }

    const imageUrl = await uploadFile(logo, name);
    await team.create({
      name: name.toLowerCase(),
      type,
      players,
      numberOfMatches,
      wins,
      loses,
      draw,
      cleanSheets,
      logo: imageUrl,
    });

    return res.status(200).send({
      success: true,
      message: "Team created",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const addPlayersInTeam = async (req, res) => {
  try {
    const id = req.params.id;

    const { players } = req.body;

    const Team = await team.findById(id);

    if (!Team) {
      return res.status(404).send({
        success: false,
        message: "Team not found",
      });
    }

    players.forEach((playerId) => {
      if (!Team.players || !Team.players.includes(playerId)) {
        Team.players.push(playerId);
      }
    });

    Team.save();
    return res.status(200).send({
      success: true,
      message: "Players added successfully",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// export const getTeamDetails = async(req,res) => {
//     try {
//         const id = req.params.id;

//         const teamDetails = await team.findById(id).populate('players');

//         if(!teamDetails){
//             return res.status(404).send({
//                 success: false,
//                 message: 'Team Not found'
//             })
//         }

//         return res.status(200).send({
//             success: true,
//             message: 'Team details fetched successfully',
//             teamDetails
//         })
//     } catch (error) {
//         return res.status(500).send({
//             success: false,
//             message: 'Internal Server Error  here'
//         })
//     }
// }

export const getTeamDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Fetch Team Details
    const teamDetails = await team.findById(id).populate("players"); // Populate players info
    if (!teamDetails) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Step 2: Find Matches where the team has played
    const matches = await match.find({
      $or: [{ teamA: id }, { teamB: id }],
    });

    // Initialize variables for calculating stats
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goals = 0;
    let yellowCards = 0;
    let redCards = 0;
    let cleanSheets = 0;

    // Step 3: Calculate Wins, Draws, Losses, Goals, Yellow Cards, Red Cards
    matches.forEach((m) => {
      // Determine if the team is teamA or teamB
      const isTeamA = m.teamA.toString() === id;

      // Count goals, yellow cards, red cards
      if (isTeamA) {
        goals += m.teamAEvents.filter((event) => event.type === "goal").length;
        yellowCards += m.teamAEvents.filter(
          (event) => event.type === "yellowCard"
        ).length;
        redCards += m.teamAEvents.filter(
          (event) => event.type === "redCard"
        ).length;
        if (m.teamBScore === 0) cleanSheets++;
        // Determine the result of the match
        if (m.teamAScore > m.teamBScore) wins++;
        else if (m.teamBScore < m.teamAScore) losses++;
        else {
          if (
            m.teamAPenalties &&
            m.teamBPenalties &&
            m.teamAPenalties > m.teamBPenalties
          )
            wins++;
          else if (
            m.teamAPenalties &&
            m.teamBPenalties &&
            m.teamAPenalties < m.teamBPenalties
          )
            losses++;
          else draws++;
        }
      } else {
        goals += m.teamBEvents.filter((event) => event.type === "goal").length;
        yellowCards += m.teamBEvents.filter(
          (event) => event.type === "yellowCard"
        ).length;
        redCards += m.teamBEvents.filter(
          (event) => event.type === "redCard"
        ).length;
        if (m.teamAScore === 0) cleanSheets++;
        // Determine the result of the match
        if (m.teamBScore > m.teamAScore) wins++;
        else if (m.teamBScore < m.teamAScore) losses++;
        else {
          if (
            m.teamAPenalties &&
            m.teamBPenalties &&
            m.teamBPenalties > m.teamAPenalties
          )
            wins++;
          else if (
            m.teamAPenalties &&
            m.teamBPenalties &&
            m.teamBPenalties < m.teamAPenalties
          )
            losses++;
          else draws++;
        }
      }
    });

    calculatePlayerStats(teamDetails.players[0]._id);

    // Step 4: Fetch stats for each player
    const playersWithStats = await Promise.all(
      teamDetails.players.map(async (player) => {
        const stats = await calculatePlayerStats(player._id);
        return {
          ...stats,
        };
      })
    );

    // Step 5: Send response with team details and calculated stats
    res.status(200).json({
      success: true,
      message: "Team Details fetched successfully",
      teamDetails: {
        _id: teamDetails._id,
        name: teamDetails.name,
        type: teamDetails.type,
        logo: teamDetails.logo,
        numberOfMatches: matches.length, // Number of matches played
        cleanSheets,
        wins,
        draw: draws,
        loses: losses,
        goals,
        yellowCards,
        redCards,
        players: playersWithStats, // Populated player details
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllTeamsList = async (req, res) => {
  try {
    const teamsList = await team.find({}).populate("players");

    return res.status(200).send({
      success: true,
      teamsList,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const id = req.params.id;

    const Team = await team.findByIdAndDelete(id);

    return res.status(200).send({
      success: true,
      message: "Team Deleted successfully",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateTeamDetails = async (req, res) => {
  try {
    const id = req.params.id;

    const image = req.file;

    const {
      name,
      type,
      players,
      numberOfMatches,
      wins,
      loses,
      draw,
      cleanSheets,
      logo,
    } = req.body;

    const Team = await team.findById(id);

    if (!Team) {
      return res.status(404).send({
        success: false,
        message: "Team Not found",
      });
    }

    if (name) Team.name = name;
    if (type) Team.type = type;
    if (players) Team.players = players;
    if (numberOfMatches) Team.numberOfMatches = numberOfMatches;
    if (wins) Team.wins = wins;
    if (loses) Team.loses = loses;
    if (draw) Team.draw = draw;
    if (cleanSheets) Team.cleanSheets = cleanSheets;
    if (logo) Team.logo = logo;

    console.log(image);
    const imageUrl = await uploadFile(image);

    if (imageUrl) Team.logo = imageUrl;

    if (!logo && !image) Team.logo = null;
    await Team.save();

    return res.status(200).send({
      success: true,
      message: "Team Details Updated",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getPlayersOfTeam = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id)
      return res.status(404).send({
        success: false,
        message: "Team Id not found",
      });

    const Team = await team.findById(id).populate("players");

    if (!Team)
      return res.status(404).send({
        success: false,
        message: "Team Not found",
      });

    return res.status(200).send({
      success: true,
      players: Team.players,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getLatestTournamentTeams = async (req, res) => {
  console.log("req", req);
  try {
    const LatestTournament = await latestTournament.find({});
    if (LatestTournament.length === 0)
      return res.status(400).send({
        success: false,
        message: "Latest Tournament Not set",
      });

    const Tournament = await tournament
      .findById(LatestTournament[0].tournament._id)
      .populate("teams");

    if (!Tournament)
      return res.status(404).send({
        success: false,
        message: "Tournament Not found",
      });

    return res.status(200).send({
      success: true,
      teams: Tournament.teams,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};
