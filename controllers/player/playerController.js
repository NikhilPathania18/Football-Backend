import uploadFile from "../../helpers/fileUpload.js";
import player from "./../../models/Player.js";
import match from "../../models/Match.js";

export const createPlayer = async (req, res) => {
  try {
    const { name, rollNo, branch, startYear, endYear, position } = req.body;
    const image = req.file;
    if (!name || !rollNo) {
      return res.status(400).send({
        success: false,
        message: "Name and Roll Number are required",
      });
    }

    if (await player.findOne({ rollNo })) {
      return res.status(400).send({
        success: false,
        message: "Player is already registered",
      });
    }

    const imageLink = await uploadFile(image, rollNo);

    const Player = await player.create({
      name,
      rollNo,
      branch,
      startYear,
      endYear,
      position,
      image: imageLink,
    });

    return res.status(200).send({
      success: true,
      message: "Player created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updatePlayer = async (req, res) => {
  try {
    console.log("req body", req.body);
    const {
      name,
      rollNo,
      branch,
      startYear,
      endYear,
      position,
      goals,
      assists,
      yellowCards,
      redCards,
      matches,
    } = req.body;
    const id = req.params.id;
    const image = req.file;
    const Player = await player.findById(id);

    if (!Player) {
      return res.status(404).send({
        success: false,
        message: "Player not found",
      });
    }
    console.log(name, typeof name);
    console.log(rollNo, typeof rollNo);
    console.log(startYear, typeof startYear);
    console.log(endYear, typeof endYear);

    if (name && name !== "undefined") Player.name = name;
    if (rollNo && rollNo !== "undefined") Player.rollNo = rollNo;
    if (branch && branch !== "undefined") Player.branch = branch;
    if (startYear && startYear !== "undefined") Player.startYear = startYear;
    if (endYear && endYear !== "undefined") Player.endYear = endYear;
    if (position && position !== "undefined") Player.position = position;
    if (goals && goals !== "undefined") Player.goals = goals;
    if (assists && assists !== "undefined") Player.assists = assists;
    if (yellowCards && yellowCards !== "undefined")
      Player.yellowCards = yellowCards;
    if (redCards && redCards !== "undefined") Player.redCards = redCards;
    if (matches && matches !== "undefined") Player.matches = matches;
    const imageUrl = await uploadFile(image, rollNo);

    if (imageUrl) Player.image = imageUrl;

    await Player.save();

    return res.status(200).send({
      success: true,
      message: "Player details updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

// export const getPlayerDetails = async(req,res) => {
//     try {
//         const id = req.params.id;
//         const playerDetails = await player.findById(id);

//         if(!playerDetails){
//             return res.status(404).send({
//                 success: false,
//                 message: 'Player Not found'
//             })
//         }
//         return res.status(200).send({
//             success: true,
//             message: 'Player details fetched successfully',
//             playerDetails
//         })
//     } catch (error) {
//         console.log(error)
//         return res.status(500).send({
//             success: false,
//             message: 'Internal Server Error'
//         })
//     }
// }

export const getPlayerDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Fetch Player Details
    const playerDetails = await player.findById(id);
    if (!playerDetails) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Step 2: Find Matches where the player has played
    const matches = await match.find({
      $or: [{ playersA: id }, { playersB: id }],
    });

    // Initialize variables for calculating stats
    let goals = 0;
    let assists = 0;
    let yellowCards = 0;
    let redCards = 0;

    // Step 3: Calculate Goals, Assists, Yellow Cards, Red Cards
    matches.forEach((m) => {
      // Check in teamAEvents if the player belongs to team A
      m.teamAEvents.forEach((event) => {
        if (event.player && event.player.toString() === id) {
          if (event.type === "goal" && event.goalType !== "ownGoal") goals++;
          if (event.type === "yellowCard") yellowCards++;
          if (event.type === "redCard") redCards++;
        }
        if (event.assist && event.assist.toString() === id) assists++;
      });

      // Check in teamBEvents if the player belongs to team B
      m.teamBEvents.forEach((event) => {
        if (event.player && event.player.toString() === id) {
          if (event.type === "goal" && event.goalType !== "ownGoal") goals++;
          if (event.type === "yellowCard") yellowCards++;
          if (event.type === "redCard") redCards++;
        }

        if (event.assist && event.assist.toString() === id) assists++;
      });
    });

    // Step 4: Send response with player details and calculated stats
    res.status(200).json({
      success: true,
      message: "Player details fetched successfully",
      playerDetails: {
        _id: playerDetails._id,
        name: playerDetails.name,
        rollNo: playerDetails.rollNo,
        branch: playerDetails.branch,
        matches: matches.length, // Number of matches player played in
        goals,
        assists,
        position: playerDetails.position,
        yellowCards,
        redCards,
        image: playerDetails.image, // Assuming the image is a URL or file path
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllPlayers = async (req, res) => {
  try {
    const { branchYear } = req.params;
    let year = "",
      branch = "";
    if (branchYear > 2000 && branchYear < 3000) year = branchYear;
    else if (branchYear != "all") branch = branchYear;

    if (year.length != 0) {
      const playersList = await player.find({ startYear: year });
      return res.status(200).send({
        success: true,
        playersList,
      });
    } else if (branch.length != 0) {
      const playersList = await player.find({ branch });
      return res.status(200).send({
        success: true,
        playersList,
      });
    } else {
      const playersList = await player.find({});
      return res.status(200).send({
        success: true,
        playersList,
      });
    }
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deletePlayer = async (req, res) => {
  try {
    const id = req.params.id;

    const Player = await player.findById(id);

    if (!player) {
      return res.status(404).send({
        success: false,
        message: "Player does not exist",
      });
    }

    await player.findByIdAndDelete(id);

    return res.status(200).send({
      success: true,
      message: "Player deleted successfully",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getPlayersWithMostGoals = async (req, res) => {
  try {
    const playerList = await player
      .find({})
      .sort({ goals: -1, assists: -1, matches: 1 })
      .limit(100);

    return res.status(200).send({
      success: true,
      playerList,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getPlayersWithMostAssists = async (req, res) => {
  try {
    const playerList = await player
      .find({})
      .sort({ assists: -1, goals: -1, matches: 1 })
      .limit(100);
    return res.status(200).send({
      success: true,
      playerList,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getPlayersWithMostYellowCards = async (req, res) => {
  try {
    const playerList = (
      await player.find({}).sort({ yellowCards: -1, redCards: -1, matches: 1 })
    ).limit(100);
    return res.status(200).send({
      success: true,
      playerList,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getPlayersWithMostRedCards = async (req, res) => {
  try {
    const playerList = await player
      .find({})
      .sort({ redCards: -1, yellowCards: -1, matches: 1 })
      .limit(100);
    return res.status(200).send({
      success: true,
      playerList,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};
