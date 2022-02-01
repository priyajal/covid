const express = require("express");
const app = express();

const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

app.use(express.json());
module.exports = app;

const dbPath = path.join(__dirname, "covid19India.db");

let db = null;

const InitializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server started");
    });
  } catch (e) {
    console.log(e.message);
  }
};

InitializeDbAndServer();

const convertDbObjToResponseObj = (dbObj) => {
  return {
    stateId: dbObj.state_id,
    stateName: dbObj.state_name,
    population: dbObj.population,
  };
};

const convertDbDistrictObjToResponseObj = (dbObj) => {
  return {
    districtName: dbObj.district_name,
    stateId: dbObj.state_id,
    cases: dbObj.cases,
    cured: dbObj.cured,
    active: dbObj.active,
    deaths: dbObj.deaths,
  };
};
//API GET STATE DETAILS
app.get("/states/", async (request, response) => {
  const getAllStateDetailsQuery = `
 select
 *
 from state 
 `;
  const statesArray = await db.all(getAllStateDetailsQuery);
  response.send(
    statesArray.map((state) => {
      return convertDbObjToResponseObj(state);
    })
  );
});

//API PARTICULAR STATE DETAILS

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateDetailsQuery = `
 select
 *
 from state 
 where state_id = ${stateId}
 `;
  const statesArray = await db.get(getStateDetailsQuery);
  response.send(convertDbObjToResponseObj(statesArray));
});

//API POST DISTRICT

app.post("/districts/", async (request, response) => {
  try {
    const {
      districtName,
      stateId,
      cases,
      cured,
      active,
      deaths,
    } = request.body;

    const AddNewDistrict = `
  insert into
  district(district_name,state_id,cases,cured,active,deaths)
  values('${districtName}',${stateId},${cases},${cured},${active},${deaths})

  `;
    const addDistrict = await db.run(AddNewDistrict);

    response.send("District Successfully Added");
  } catch (e) {
    console.log(e.message);
  }
});

//API GET PARTICULAR DISTRICT

app.get("/districts/:districtId/", async (request, response) => {
  try {
    const { districtId } = request.params;
    const getDistrict = `
  select
  *
  from district
  where district_id = ${districtId}
  `;
    const addDistrict = await db.get(getDistrict);

    response.send(convertDbDistrictObjToResponseObj(addDistrict));
  } catch (e) {
    console.log(e.message);
  }
});

//API DELETE DISTRICT

app.get("/districts/:districtId/", async (request, response) => {
  try {
    const { districtId } = request.params;
    const deleteDistrict = `
  delete
  from district
  where district_id = ${districtId}
  `;
    await db.run(deleteDistrict);

    response.send("District Removed");
  } catch (e) {
    console.log(e.message);
  }
});

//API UPDATE DISTRICT

app.put("/districts/:districtId/", async (request, response) => {
  try {
    const { districtId } = request.params;
    const {
      districtName,
      stateId,
      cases,
      cured,
      active,
      deaths,
    } = request.body;

    const AddNewDistrict = `
  update
  district
  set district_name='${districtName}',
  state_id=${stateId},cases=${cases},cured=${cured},active=${active},deaths=${deaths}

  `;
    await db.run(AddNewDistrict);

    response.send("District Details Updated");
  } catch (e) {
    console.log(e.message);
  }
});

//API GET STATS
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;

  const getStateDetailsQuery = `
 select
 *
 from district
 where state_id = ${stateId}
 group by state_id
 `;
  const statesArray = await db.get(getStateDetailsQuery);

  response.send(statesArray);
});
