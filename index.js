    const express = require("express");
    const { request } = require("http");
    const path = require("path");
    const {open } = require("sqlite")
    const sqlite3 = require("sqlite3")
    const app = express();
    app.use(express.json())
    
    const dbPath = path.join(__dirname, "data.db")
    
    let db = null;
    
    
    const initialzeDBAndServer = async () => {
    
    
    try {
    
    db = await open ({
        filename:dbPath,
        driver:sqlite3.Database,
        });

       // Create tables if they do not exist
    await db.exec(`
     
      CREATE TABLE IF NOT EXISTS mentors (
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  name TEXT, 
  availability TEXT, 
  areas_of_expertise TEXT, 
  is_premium BOOLEAN
);
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  name TEXT, 
  availability TEXT, 
  area_of_interest TEXT
);
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  student_id INTEGER, 
  mentor_id INTEGER, 
  time TEXT, 
  duration INTEGER, 
  status TEXT,
  FOREIGN KEY (student_id) REFERENCES students (id),
  FOREIGN KEY (mentor_id) REFERENCES mentors (id)
);

    `);

        app.listen(3000, ()=> {
            console.log("Server Running at http://localhost:3000/")
        });
    
    }catch(e){
     
        console.log(`DB Error: ${e.message}`);
        process.exit(1)
        
    }};
    
    
    initialzeDBAndServer()
    
    
    // API ENDSPOINT 

    app.post("/mentors/", async (request, response) => {
      const mentorsDetails = request.body;
      const { name, availability, areas_of_expertise, is_premium } = mentorsDetails;
      
      const addMentorsQuery = `
          INSERT INTO mentors (name, availability, areas_of_expertise, is_premium)
          VALUES ('${name}', '${availability}', '${areas_of_expertise}', ${is_premium});
      `;
      
      const dbResponse = await db.run(addMentorsQuery);
      const mentorsId = dbResponse.lastID;
      response.send({ mentorsId: mentorsId });
  });
  




    
    // GET AVAILABEL MENTORS 
  
    app.get("/mentors/", async (request, response) => {
      const getMentorsQuery = `
          SELECT * FROM mentors
          ORDER BY id;
      `;
      
      const mentorsArray = await db.all(getMentorsQuery);
      response.send(mentorsArray);
  });
  
  app.get("/mentors/:mentorId/", async (request, response) => {
    const { mentorId } = request.params;
    const getMentorsQuery = `
        SELECT * FROM mentors
        WHERE id = ${mentorId};
    `;
    
    const mentor = await db.get(getMentorsQuery);
    response.send(mentor);
});

app.post("/students/", async (request, response) => {
  const studentsDetails = request.body;
  const { name, availability, area_of_interest } = studentsDetails;
  
  const addStudentsQuery = `
      INSERT INTO students (name, availability, area_of_interest)
      VALUES ('${name}', '${availability}', '${area_of_interest}');
  `;
  
  const dbResponse = await db.run(addStudentsQuery);
  const studentsId = dbResponse.lastID;
  response.send({ studentsId: studentsId });
});

    
app.get("/students/", async (request, response) => {
  const getStudentQuery = `
      SELECT * FROM students
      ORDER BY id;
  `;
  
  const studentsArray = await db.all(getStudentQuery);
  response.send(studentsArray);
});

    
app.get("/students/:studentId/", async (request, response) => {
  const { studentId } = request.params;
  const getStudentQuery = `
      SELECT * FROM students
      WHERE id = ${studentId};
  `;
  
  const student = await db.get(getStudentQuery);
  response.send(student);
});

    
app.post("/bookings/", async (request, response) => {
  const bookingsDetails = request.body;
  const { student_id, mentor_id, duration, time } = bookingsDetails;
  
  const addBookingQuery = `
      INSERT INTO bookings (student_id, mentor_id, duration, time)
      VALUES (${student_id}, ${mentor_id}, ${duration}, '${time}');
  `;
  
  const dbResponse = await db.run(addBookingQuery);
  const bookingId = dbResponse.lastID;
  response.send({ bookingId: bookingId });
});

  
app.get("/bookings/", async (request, response) => {
  const getBookingQuery = `
      SELECT * FROM bookings
      ORDER BY id;
  `;
  
  const bookingArray = await db.all(getBookingQuery);
  response.send(bookingArray);
});


app.get("/bookings/:bookingId/", async (request, response) => {
  const { bookingId } = request.params;
  const getBookingQuery = `
      SELECT * FROM bookings
      WHERE id = ${bookingId};
  `;
  
  const booking = await db.get(getBookingQuery);
  response.send(booking);
});

    