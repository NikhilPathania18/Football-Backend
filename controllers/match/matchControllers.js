import match from "../../models/Match.js";
import player from "../../models/Player.js";
import team from "../../models/Team.js";
import tournamentModel from './../../models/Tournament.js';

const decorateTime = (time) => {
  let hours, minutes;

  time = time.split(' ')

  console.log('time' , time)
  if(time[1]!="AM"&&time[1]!="PM")  return false;

  minutes = Number(time[0].split(':')[1])
  hours = Number(time[0].split(":")[0])

  if(time[1]=="PM") hours+=12;

  if(hours==24) hours = 0;
  if(minutes == 60) minutes = 0;

  if(hours>=24||minutes>=60)  return false;

  return {hours,minutes};
}


console.log(decorateTime("23:30 PM"))
export const newMatch = async (req, res) => {
  try {
    const {
      tournament,
      matchNumber,
      matchName,
      venue,
      date,
      halfLength,
      extraTimeHalfLength,
      teamA,
      teamB,
      playersA,
      playersB,
      teamAEvents,
      teamBEvents,
      teamAScore,
      teamBScore,
      teamAPenalties,
      teamBPenalties,
      status,
      isKnockout,
      time
    } = req.body;

    if (!tournament || !teamA || !teamB || !date || !halfLength || !time) {
      return res.status(400).send({
        success: false,
        message: "Please provide all required fields",
      });
    }
    const decoratedTime = decorateTime(time);

    if(!decoratedTime)  return res.status(400).send({
      success: false,
      message: 'Invalid Time'
    })

    
    const Tournament = await tournamentModel.findById(tournament);
    if(!Tournament) return res.status(404).send({
      success: false,
      message: 'Tournament Not Found'
    })

    const matchDetails = await match.create({
      tournament,
      matchNumber,
      matchName,
      date: new Date(`${date} ${decoratedTime.hours}:${decoratedTime.hours}:${decoratedTime.minutes}:00`),
      venue,
      halfLength,
      extraTimeHalfLength,
      teamA,
      teamB,
      playersA,
      playersB,
      teamAEvents,
      teamBEvents,
      teamAScore,
      teamBScore,
      teamAPenalties,
      teamBPenalties,
      isKnockout: isKnockout?isKnockout:false,
      status: status ? status : "upcoming",
    });

    Tournament.matches.push(matchDetails._id);
    await Tournament.save();

    
    return res.status(200).send({
      success: true,
      message: "Match created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const endMatch = async (req, res) => {
  try {
    const id = req.params.id;

    const matchDetails = await match.findById(id);

    if (!matchDetails) {
      return res.status(404).send({
        success: false,
        message: "Match not found",
      });
    }

    //find winner of match
    if (matchDetails.teamAScore > matchDetails.teamBScore)
      matchDetails.winner = "A";
    else if (matchDetails.teamBScore > matchDetails.teamAScore)
      matchDetails.winner = "B";
    else if (matchDetails.teamAPenalties && matchDetails.teamBPenalties) {
      if (matchDetails.teamAPenalties > matchDetails.teamBPenalties)
        matchDetails.winner = "A";
      else matchDetails.winner = "B";
    } else matchDetails.winner = "draw";

    //increase stats of teams
    const teamA = await team.findById(matchDetails.teamA);
    const teamB = await team.findById(matchDetails.teamB);

    teamA.numberOfMatches++;
    teamB.numberOfMatches++;

    teamA.goals += matchDetails.teamAScore;
    teamB.goals += matchDetails.teamBScore;

    if (matchDetails.winner === "draw") {
      teamA.draw++;
      teamB.draw++;
    } else if (matchDetails.winner === "A") {
      teamA.wins++;
      teamB.loses++;
    } else {
      teamB.wins++;
      teamA.loses++;
    }

    if (matchDetails.teamAScore === 0) {
      teamA.cleanSheets++;
    }
    if (matchDetails.teamBScore === 0) {
      teamB.cleanSheets++;
    }

    await teamA.save();
    await teamB.save();

    //update stats of player

    const playersA = matchDetails.playersA;
    const playersB = matchDetails.playersB;

    await player.updateMany(
      { _id: { $in: [...playersA, ...playersB] } },
      { $inc: { matches: 1 } },
      { new: true }
    );

    const teamAEvents = matchDetails.teamAEvents;
    const teamBEvents = matchDetails.teamBEvents;
    const updateStats = async (event) => {
      const Player = await player.findById(event.player);
      if (!Player) return;
      if (event.type === "goal") {
        Player.goals++;

        if (event.assist) {
          const assister = await player.findById(event.assist);
          if (assister) {
            assister.assists++;
            await assister.save(); // Make sure to use 'await' here to properly handle the promise
          }
        }
      } else if (event.type === "yellowCard") {
        Player.yellowCards++;
      } else if (event.type === "redCard") {
        Player.redCards++;
      }

      await Player.save();
    };

    // Create an array of promises by calling updateStats for each event
    const updatePromises = [...teamAEvents, ...teamBEvents].map((event) =>
      updateStats(event)
    );

    matchDetails.status = "ended";
    await matchDetails.save();

    await Promise.all(updatePromises);

    return res.status(200).send({
      success: true,
      message: "Match ended",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateWholeMatch = async (req, res) => {
  try {
    const id = req.params.id;
    const dataToUpdate = req.body;

    const Match = await match.findOneAndUpdate(
      { _id: id },
      { $set: dataToUpdate },
      { new: true }
    );

    if (!Match) {
      return res.status(404).send({
        success: false,
        message: "Match not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Match details updated",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateScore = async (req, res) => {
  try {
    const id = req.params.id;
    const { team, event } = req.body;
    const Match = await match.findById(id);

    if (!Match) {
      return res.status(404).send({
        success: false,
        message: "Match not found",
      });
    }

    if (Match.status === "ended") {
      return res.status(400).send({
        success: false,
        message: "Match has ended",
      });
    }

    Match.status = "ongoing";

    if(!event.time||event.time.length === 0){
      const currentStatus = Match.currentStatus;
      let startTime ;

      if(currentStatus==='firstHalf') startTime = Match.firstHalfStartTime
      else if(currentStatus === 'secondHalf') startTime = Match.secondHalfStartTime;
      else if(currentStatus === 'extraTimeFirstHalf') startTime = Match.extraTimeFirstHalfStartTime;
      else if(currentStatus === 'extraTimeSecondHalf')
      startTime = Match.extraTimeSecondHalfStartTime;
      
      let endTime = new Date();
      let timeDiff = endTime - startTime;
      let timeInMinutes = timeDiff / (1000 * 60);
      let updatedTime = Math.ceil(timeInMinutes);

      if(currentStatus==='firstHalf'){
        if (updatedTime > Match.halfLength)
        event.time = Match.halfLength + "+" + (updatedTime - Match.halfLength) 
        else event.time = updatedTime+""
      }
      else if(currentStatus === 'secondHalf'){
        if (updatedTime > Match.halfLength) 
        event.time = Match.halfLength * 2 + "+" + (updatedTime - Match.halfLength) 
        else event.time=(Match.halfLength + updatedTime)+""
      }
      else if(currentStatus === 'extraTimeFirstHalf'){
        if (updatedTime > Match.extraTimeHalfLength ) {
          event.time = 2 * Match.halfLength + Match.extraTimeHalfLength +"+" +(updatedTime - Match.extraTimeHalfLength);
        }
        else
        event.time = 2 * Match.halfLength + updatedTime + ""
      }
      else if(currentStatus === 'extraTimeSecondHalf'){
        if(updatedTime > Match.extraTimeHalfLength){
          event.time = 2* Match.halfLength + 2*Match.extraTimeHalfLength + "+" (updatedTime - Match.extraTimeHalfLength);
        }
        else
        event.time = 2* Match.halfLength + Match.extraTimeHalfLength + updatedTime + ""
      }
    }


    if (team === "A") {
      Match.teamAScore++;
      Match.teamAEvents.push(event);
    }
    if (team === "B") {
      Match.teamBScore++;
      Match.teamBEvents.push(event);
    }

    // const Player =await  player.findById(event.player);
    // if(Player){
    //   Player.goals++;
    //   await Player.save();
    // }

    // if(event.assist){
    //   const Assister = await player.findById(event.assist);
    //   if(Assister){
    //     Assister.assists++;
    //     await Assister.save();
    //   }
    // }

    await Match.save();

    return res.status(200).send({
      success: true,
      message: "Match Data updated",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const { team, event } = req.body;
    console.log('event',event)

    const Match = await match.findById(id);

    if (!Match) {
      return res.status(404).send({
        success: false,
        message: "Match not found",
      });
    }
    if(!event.time||event.time.length === 0){
      const currentStatus = Match.currentStatus;
      let startTime ;

      if(currentStatus==='firstHalf') startTime = Match.firstHalfStartTime
      else if(currentStatus === 'secondHalf') startTime = Match.secondHalfStartTime;
      else if(currentStatus === 'extraTimeFirstHalf') startTime = Match.extraTimeFirstHalfStartTime;
      else if(currentStatus === 'extraTimeSecondHalf')
      startTime = Match.extraTimeSecondHalfStartTime;
      
      let endTime = new Date();
      let timeDiff = endTime - startTime;
      let timeInMinutes = timeDiff / (1000 * 60);
      let updatedTime = Math.ceil(timeInMinutes);

      if(currentStatus==='firstHalf'){
        if (updatedTime > Match.halfLength)
        event.time = Match.halfLength + "+" + (updatedTime - Match.halfLength) 
        else event.time = updatedTime+""
      }
      else if(currentStatus === 'secondHalf'){
        if (updatedTime > Match.halfLength) 
        event.time = Match.halfLength * 2 + "+" + (updatedTime - Match.halfLength) 
        else event.time=(Match.halfLength + updatedTime)+""
      }
      else if(currentStatus === 'extraTimeFirstHalf'){
        if (updatedTime > Match.extraTimeHalfLength ) {
          event.time = 2 * Match.halfLength + Match.extraTimeHalfLength +"+" +(updatedTime - Match.extraTimeHalfLength);
        }
        else
        event.time = 2 * Match.halfLength + updatedTime + ""
      }
      else if(currentStatus === 'extraTimeSecondHalf'){
        if(updatedTime > Match.extraTimeHalfLength){
          event.time = 2* Match.halfLength + 2*Match.extraTimeHalfLength + "+" (updatedTime - Match.extraTimeHalfLength);
        }
        else
        event.time = 2* Match.halfLength + Match.extraTimeHalfLength + updatedTime + ""
      }
    }

    if (team === "A") Match.teamAEvents.push(event);
    else if (team === "B") Match.teamBEvents.push(event);

    await Match.save();

    return res.status(200).send({
      success: true,
      message: "Event added",
    });
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    const Match = await match.findById(id);
    if (!Match) {
      return res.status(404).send({
        success: false,
        message: "Match Not Found",
      });
    }
    Match.status = status;

    Match.save();

    return res.status(200).send({
      success: true,
      message: "Status updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const startHalf = async (req, res) => {
  try {
    const id = req.params.id;
    const { half } = req.body;
    console.log('half',half)
    const Match = await match.findById(id);

    if (!Match) {
      return res.status(404).send({
        success: false,
        message: "Could not find match",
      });
    }

    if (half === "firstHalf") Match.firstHalfStartTime = new Date();
    else if (half === "secondHalf") Match.secondHalfStartTime = new Date();
    else if (half === "extraTimeFirstHalf")
      Match.extraTimeFirstHalfStartTime = new Date();
    else if (half === "extraTimeSecondHalf")
      Match.extraTimeSecondHalfStartTime = new Date();

    Match.currentStatus = half;
    
    Match.status = 'ongoing';
    await Match.save();

    return res.status(200).send({
      success: true,
      message: "Half Started",
    });
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const endHalf = async (req, res) => {
  try {
    const id = req.params.id;

    const Match = await match.findById(id);

    switch (Match.currentHalf) {
      case "firstHalf":
        Match.currentHalf = "halfTime";
        break;
      case "halfTime":
        Match.currentHalf = "secondHalf";
        break;
      case "secondHalf":
        Match.currentHalf = "fullTime";
        break;
      case "fullTime":
        Match.currentHalf = "extraTimeFirstHalf";
        break;
      case "extraTimeFirstHalf":
        Match.currentHalf = "extraTimeHalfTime";
        break;
      case "extraTimeHalfTime":
        Match.currentHalf = "extraTimeSecondHalf";
        break;
      case "extraTimeSecondHalf":
        Match.currentHalf = "extraTimeFullTime";
        break;
      case "extraTimeFullTime":
        Match.currentHalf = "penalties";
        break;
      case "penalties":
        Match.currentHalf = "fullTime";
        break;
    }

    await Match.save();

    return res.status(200).send({
      success: true,
      message: "current status of half changed",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//get requests

export const getMatchDetails = async (req, res) => {
  try {
    const id = req.params.id;

    const Match = await match
      .findById(id)
      .populate("teamA")
      .populate("teamB")
      .populate("playersA")
      .populate("playersB")
      .populate('tournament')
      .populate({
        path: 'teamAEvents',
        populate:{
          path: 'player'
        }
      })
      .populate({
        path: 'teamBEvents',
        populate:{
          path: 'player'
        }
      })

    if (!Match) {
      return res.status(200).send({
        success: false,
        message: "Match not found",
      });
    }

    return res.status(200).send({
      success: true,
      matchDetails: Match,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getMatchesList = async (req, res) => {
  try {
    const status = req.params.status;
    let matchesList;
    if (status === "all") {
      matchesList = await match
        .find({})
        .populate("tournament")
        .populate("teamA")
        .populate("teamB");
      return res.status(200).send({
        success: true,
        matchesList,
      });
    } else {
      matchesList = await match.find({ status });
      return res.status(200).send({
        success: true,
        matchesList,
      });
    }
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteMatch = async (req, res) => {
  try {
    const id = req.params.id;

    const Match = await match.findByIdAndDelete(id);

    if (!Match) {
      return res.status(404).send({
        success: false,
        message: "Match Not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Match deleted successfully",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};
