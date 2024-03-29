import tournament from "../../models/Tournament.js";
import latestTournament from "../../models/LatestTournament.js";
import { getLatestTournamentId } from "../../helpers/latestTournament.js";
import { resize } from "../../helpers/resizeArray.js";
export const createTournament = async (req, res) => {
  try {
    const { type, startYear, endYear, name, schedule, teams, status } =
      req.body;

    if (!type || !startYear || !name) {
      return res.status(400).send({
        success: false,
        message: "Insufficient details to create a tournament",
      });
    }

    if (
      status &&
      status != "upcoming" &&
      status != "ongoing" &&
      status != "ended"
    ) {
      return res.status(400).send({
        success: false,
        message: "Invalid status",
      });
    }

    await tournament.create({
      type,
      startYear,
      endYear,
      name,
      schedule,
      teams,
      status,
    });

    return res.status(200).send({
      success: true,
      message: "Tournament created",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

export const addTeams = async (req, res) => {
  try {
    const id = req.params.id;
    const { teams } = req.body;

    const Tournament = await tournament.findById(id);

    if (!Tournament) {
      return res.status(404).send({
        success: false,
        message: "Tournament does not exist",
      });
    }

    teams.forEach((team) => {
      if (!Tournament.teams.includes(team)) {
        Tournament.teams.push(team);
      }
    });

    Tournament.save();

    return res.status(200).send({
      success: true,
      message: "Teams added into the tournament",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

export const changeTournamentStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    if (status != "upcoming" && status != "ongoing" && status != "ended") {
      return res.status(400).send({
        success: false,
        message: "Invalid status",
      });
    }
    const Tournament = await tournament.findById(id);
    if (!Tournament) {
      return res.status(404).send({
        success: false,
        message: "Tournament does not exist",
      });
    }
    Tournament.status = status;
    Tournament.save();

    return res.status(200).send({
      success: true,
      message: "Status of Tournament changed",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateTournamentDetails = async (req, res) => {
  try {
    const id = req.params.id;
    const dataToUpdate = req.body;

    const Tournament = await tournament.findOneAndUpdate(
      { _id: id },
      { $set: dataToUpdate },
      { new: true }
    );

    if (!Tournament) {
      return res.status(404).send({
        success: false,
        message: "Tournament not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Tournament updated successfully",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getTournamentDetails = async (req, res) => {
  try {
    const id = req.params.id;

    const tournamentDetails = await tournament.findById(id).populate({
      path: "teams",
      populate: {
        path: "players",
      },
    });

    if (!tournament) {
      return res.status(404).send({
        success: false,
        message: "Tournament not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Tournament details fetched successfully",
      tournamentDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getTournaments = async (req, res) => {
  try {
    const status = req.params.status;

    if (!status)
      return res
        .status(400)
        .send({ success: false, message: "Status is empty" });

    if (
      status != "all" &&
      status != "upcoming" &&
      status != "ongoing" &&
      status != "ended"
    ) {
      return res.status(400).send({
        success: false,
        message: "Invalid status",
      });
    }
    if (status === "all") {
      const tournamentList = await tournament.find({});
      return res.status(200).send({
        success: false,
        tournamentList,
      });
    } else {
      const tournamentList = await tournament.find({ status });
      return res.status(200).send({
        success: true,
        tournamentList,
      });
    }
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getMatchesList = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id)
      return res.status(404).send({
        success: false,
        message: "Tournament Id Not found",
      });

    const Tournament = await tournament.findById(id).populate("matches");

    if (!Tournament)
      return res.status(404).send({
        success: false,
        message: "Tournament not found",
      });

    return res.status(200).send({
      success: true,
      matches: Tournament.matches,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server Error",
    });
  }
};

export const getTeamList = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id)
      return res.status(400).send({
        success: false,
        message: "Tournament Id Not Found",
      });

    const Tournament = await tournament.findById(id).populate("teams");

    if (!Tournament)
      return res.status(404).send({
        success: false,
        message: "Tournament Not Found",
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

export const setLatestTournament = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('req recieved', id)
    if (!id)
      return res.status(400).send({
        success: false,
        message: "Tournament Id not found",
      });

    const Tournament = await tournament.findById(id);

    if (!Tournament)
      return res.status(404).send({
        success: false,
        message: "Tournament not found",
      });

    const LatestTournament = await latestTournament.find({});

    console.log('latest tournament ', LatestTournament)
    if (LatestTournament.length === 0) {
      await latestTournament.create({ tournament: id });
    } else {
      LatestTournament[0].tournament = id;
      await LatestTournament[0].save();
    }

    return res.status(200).send({
      success: true,
      message: "Latest Tournament set successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getLatestTournament = async (req, res) => {
  try {
    const LatestTournament = await latestTournament.find({}).populate({
      path: "tournament",
      populate: [
        {
          path: "teams",
          populate: {
            path: "players",
          },
        },
        {
          path: "matches",
          populate: [
            {
              path: "teamA",
            },
            {
              path: "teamB",
            },
          ],
        },
        {
          path: "pointsTable.teamStats.team"  
        }
      ],
    });

    if (LatestTournament.length === 0)
      return res.status(404).send({
        success: false,
        message: "Latest Tournament Not Set",
      });

    return res.status(200).send({
      success: true,
      latestTournament: LatestTournament[0].tournament,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

export const putTeamsInGroup = async (req, res) => {
  try {
    const { id, groups } = req.body;

    if (!id)
      return res.status(400).send({
        success: false,
        message: "Touranament Id not present",
      });

    const Tournament = await tournament.findByIdAndUpdate(id,
      { $set: { numberOfGroups: groups.length, pointsTable: [] } }, // Update numberOfGroups and reset pointsTable
      { new: true }
    );

    if (!Tournament)
      return res.status(404).send({
        success: false,
        message: "Tournament Not Found",
      });

    Tournament.numberOfGroups = groups.length;

    let groupLength = groups.length;

    for (let groupNo = 0; groupNo < groupLength; groupNo++) {
      let groupDetails = {
        title: groups[groupNo].title,
        teamStats: [],
      };
      let teams = groups[groupNo].teams;

      for (let teamNo = 0; teamNo < teams.length; teamNo++) {
        let teamDetails = {
          team: teams[teamNo],
          matches: 0,
          win: 0,
          lost: 0,
          draw: 0,
          gf: 0,
          ga: 0,
          yellowCards: 0,
          points: 0,
        };
        groupDetails.teamStats.push(teamDetails);
      }
      Tournament.pointsTable.push(groupDetails);
    }

    console.log("Tournament points Table:", Tournament.pointsTable);

    let data = await Tournament.save()

    const populatedTournament = await tournament.populate(data, {
      path: "pointsTable.teamStats.team",
      model: "team",
    });

    return res.status(200).send({
      success: true,
      message: "Teams added into the groups",
      populatedTournament,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getLatestTournamentDetails = async(req,res) => {
  try {
    const id = await getLatestTournamentId();

    if(!id) return res.status(500).send({
      success: false,
      message: 'Internal Server Error'
    })

    const Tournament = await tournament.findById(id).populate({
      path: 'pointsTable.teamStats.team',
      model: 'team'
    });

    if(!Tournament) return res.status(400).send({
      success: false,
      message: 'Latest Tournament Not Set'
    })

    return res.status(200).send({
      success: true,
      Tournament
    })

  } catch (error) {
    return res.status(500).send({
      success: false,
      message: 'Internal Server Error'
    })
  }
}

export const getTournamentStats = async(req,res) => {
  try {
    const {id} = req.params

    if(!id) return res.status(400).send({success: false, message: 'Tournament Id not present'})

    const Tournament = tournament.findById(id);

    if(!Tournament) return res.status(404).send({success: false, message: 'Tournament Not Found'})

    let tournamentStats = {
      matches: 0,
      goals: 0,
      goalsConceeded: 0,
      yellowCards: 0,
      redCards: 0,
      teams
    }
    

    let number_of_groups = Tournament.pointsTable || 0

    for(let i = 0 ; i<number_of_groups ; i++){
      let group = Tournament.pointsTable[i];

      let number_of_teams = group.teamStats.length;

      for(let j = 0 ; j<number_of_teams ; j++){
        let team_details = group.teamStats[j];

        tournamentStats.teams++;
        tournamentStats.matches+=team_details.matches;
        tournamentStats.goals+=team_details.gf;
        tournamentStats.goalsConceeded+=team_details.ga;
        tournamentStats.yellowCards+=team_details.yellowCards;
        tournamentStats.redCards+=team_details.redCards;
      }

    }

    let teamStats = [
      {logo: '', name: '', gf: '', gc: ''}
    ]
    
    let number_of_matches = Tournament.matches.length;

    for(let matchNo = 0; matchNo<number_of_matches; matchNo++){
      const match = Tournament.matches[matchNo];
      

    }


  } catch (error) {
    return res.status(500).send({
      success: false,
      message: 'Internal Server Error'
    })
  }
}

export const getLatestTournamentStats = async(req,res)=>{
  try {
    const LatestTournament = await latestTournament.find({}).populate({
      path: "tournament",
      populate: [
        {
          path: "teams",
          populate: {
            path: "players",
          },
        },
        {
          path: "matches",
          populate: [
            {
              path: "teamA",
            },
            {
              path: "teamB",
            },
          ],
        },
        {
          path: "pointsTable.teamStats.team"  
        },
        {
          path: "mostGoals",
          populate: [
            {
              path: "player"
            }
          ]
        },
        {
          path: "mostAssists",
          populate: [
            {
              path: "player"
            }
          ]
        },
        {
          path: "mostYellow",
          populate: [
            {
              path: "player"
            }
          ]
        },
        {
          path: "mostRed",
          populate: [
            {
              path: "player"
            }
          ]
        }
      ],
    });

    let matchesCount = 0

    LatestTournament[0].tournament.matches.forEach((match)=>{
      if(match.status==="ended")  matchesCount++;
    })
    let tournamentStats = {
      goals: LatestTournament[0].tournament.numberOfGoals,
      teams: LatestTournament[0].tournament.teams.length,
      matches: matchesCount,
      yellowCards: LatestTournament[0].tournament.yellowCards,
      redCards: LatestTournament[0].tournament.redCards,
      mostGoals: resize(LatestTournament[0].tournament.mostGoals, 5) ,
      mostAssists: resize(LatestTournament[0].tournament.mostAssists, 5) ,
      mostRed: resize(LatestTournament[0].tournament.mostRed, 5) ,
      mostYellow: resize(LatestTournament[0].tournament.mostYellow, 5) 
    }

    return res.status(200).send({
      success: true,
      tournamentStats,
      LatestTournament
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      success: false,
      message: 'Internal Server Error'
    })
  }
}