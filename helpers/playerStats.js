import match from "../models/Match.js";
import player from "../models/Player.js";

export const calculatePlayerStats = async (id) => {
  try {
    // Step 1: Fetch Player Details
    const playerDetails = await player.findById(id);
    if (!playerDetails) {
      return;
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
        if (event.player && event.player.toString() === id.toString()) {
          if (event.type === "goal" && event.goalType !== "ownGoal") goals++;
          if (event.type === "yellowCard") yellowCards++;
          if (event.type === "redCard") redCards++;
        }
        if (event.assist && event.assist.toString() === id.toString()) assists++;
      });

      // Check in teamBEvents if the player belongs to team B
      m.teamBEvents.forEach((event) => {
        if (event.player && event.player.toString() === id.toString()) {
          if (event.type === "goal" && event.goalType !== "ownGoal") goals++;
          if (event.type === "yellowCard") yellowCards++;
          if (event.type === "redCard") redCards++;
        }

        if (event.assist && event.assist.toString() === id.toString()) assists++;
      });
    });
    // Step 4: Send response with player details and calculated stats
    return {
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
    };
  } catch (error) {
    console.error(error);
  }
};
