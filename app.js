//making objects handles of the added dependencies
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mysql=require("mysql");
const nodemailer=require("nodemailer");

//creating the express object
const app=express();

//body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//setting view engie to ejs
app.set('view engine','ejs');
app.use(express.static("public"));

function genAuthPin()
{
    var randomNum;
    var randomString="";
    for(i=0;i<4;i++)
    {
        //generates random number from 1-5
        randomNum=(Math.floor((Math.random()*5))+1);  

        randomString+=randomNum.toString();
    }
    console.log(randomString);
}




//------------------------------------------//
//   Creating Database Connection           //
//------------------------------------------//
var con=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:'fcapms'
});
con.connect(function(err) {
  if (err) throw err;
  console.log("Database Connected Successfully!");
});

//-----------------------------------------//
//              Nodemailer                 //
//-----------------------------------------//
let mailTransporter=nodemailer.createTransport(
{
    service:"gmail",
    auth:{
        user:"cashingp4@gmail.com",
        pass:"liicwnjpctftsfib"
    }
})




//----------------Routing------------------//


//------------------------------------------//
//   SERVING STD SIGN IN ON HOME ROUTE      //
//------------------------------------------//
app.get("/",function(req,res){
    res.sendFile(__dirname+"/public/student_login.html");
    
})
//-------------------------------------------//
// POST REQUEST RECIEVED FROM SIGN IN PAGE   //
//-------------------------------------------//
app.post("/",function(req,res)
{
    //getting submitted email and password
    const email=req.body.email;
    const password=req.body.password;
    let authStatus="";


    sql="select authStatus from members where email=?";
    con.query(sql,email,function(err,result){
        if(err)
        {
            throw err;
        }
        console.log("authStatus returned success");
        authStatus=result[0].authStatus;

        if(authStatus==1)
        {
            res.redirect("/in");
        }
        else
        {
            res.redirect("/out");
        }
    })
    
    console.log(email);
    console.log(password);
})


app.get("/in",function(req,res){
    res.sendFile(__dirname+"/public/in.html");
})

app.get("/out",function(req,res){
    res.sendFile(__dirname+"/public/out.html");
})

//--------------------------------------------//
//    Serving Member Registration Form        //
//--------------------------------------------//
app.get("/member-registration",function(req,res)
{
    res.sendFile(__dirname+"/public/studentRegistration.html");
})

app.post("/member-registration",function(req,res)
{
    const name=req.body.memberName;
    const age=req.body.memberAge;
    const semester=req.body.memberSemester;
    const cgpa=req.body.memberCgpa;
    const phone=req.body.memberPhone;
    const intro=req.body.memberIntro;
    const authPin=genAuthPin();
    const authStatus="0";
    const email=req.body.memberEmail;

   let sql="INSERT INTO members (name,age,semester,section,cgpa,phone,authpin,authStatus,email) VALUES ?";
   var values=[[name,age,semester,cgpa,phone,intro,authPin,authStatus,email]];
   con.query(sql,[values],function(err,result){
    if(err)
    {
        throw err;
    }
    console.log("record Inserted "+result.affectedRows);

    let details={
        from:"cashingp4@gmail.com",
        to:email,
        subject:"Authentication Pin",
        text:authPin
    }

    mailTransporter.sendMail(details,function(err){
        if(err)
        {
            console.log("Error Encountered");
        }
        else
        {
            console.log("Email Has been Sent");
        }
    })

    res.redirect("/authpin?valid="+email)
   })

})
//--------------------------------------------//
//                Serving Verification        //
//--------------------------------------------//
app.get("/authpin",function(req,res){
    res.sendFile(__dirname+"/public/authPin.html")
})

app.post("/authpin",function(req,res)
{
    const pin=req.body.memberAuthPin;
    const email=req.body.memberEmail;
    let systemPin="";

    console.log("hi authpin post eneted");

    let sql="select authpin from members where email=?";
    con.query(sql,[email],function(err,result)
    {
        if(err)
        {
            throw err;
        }
        systemPin=result[0].authpin;
        console.log(systemPin);
        console.log(systemPin);

        if(systemPin===pin.toString())
        {
           sql="update members set authStatus=1 where email=?"
           con.query(sql,[email],function(err,result)
           {
            if(err)
            {
                throw err;
            }
            console.log("Status Updated Sucess....");
            res.redirect("/verified");
           })
        }
        else
        {
            res.redirect("/error");
        }
    })

    

})
//-------------------------------------------//
//               verified                    //
//-------------------------------------------//
app.get("/verified",function(req,res){
    res.sendFile(__dirname+"/public/verified.html");
})
app.get("/error",function(req,res){
    res.sendFile(__dirname+"/public/error.html");
})


//-------------------------------------------//
//            Hosting Server                 //
//-------------------------------------------//
app.listen(3000,function(){
    console.log("The Server is Listening on Port 3000");
})

//-------------------------------------------//
//     Generating Verfication Code           //
//-------------------------------------------//
function genAuthPin()
{
    var randomNum;
    var randomString="";
    for(i=0;i<4;i++)
    {
        //generates random number from 1-5
        randomNum=(Math.floor((Math.random()*5))+1);  

        randomString+=randomNum.toString();
    }
    return randomString;
}