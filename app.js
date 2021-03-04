import express from "express";
import exphbs from "express-handlebars";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import path from "path";
import methodOverride from "method-override";
import redis from "redis";

const port= 5000;
const app= express();

const client= redis.createClient();

client.on("connect", () => {
    console.log("Connected to redis...");
});

app.engine("handlebars", exphbs( {
    defaultLayout: "main"
}));

app.set("view engine", "handlebars");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
     extended: false
}));

app.use(methodOverride("_method"));

app.get("/", (req, res, next) => {
    res.render("index");
})

app.post("/user/search", getRepos);

async function getRepos(req, res, next)  {
    try {
        console.log("Fetching...");

        const username= req.body.username;
        console.log(username);

        const response= await fetch(`https://api.github.com/users/${username}/repos`);

        const data = await response.json();
        
        const repos= []
        const reposHtml= []

        for(var i=0; i< data.length; i++) {
            repos[i]= data[i].name;
            reposHtml[i]= data[i].html_url;
        }
        res.send(setResponse(username, repos, res));
        res.redirect("/");
    }
    catch(err) {
        console.log(err);
        res.status(500);
    }
}

// Response
function setResponse(username, repos, res) {
    res.redirect("/");
    console.log(`${username} has `);
    for(var i=0; i<repos.length; i++) {
        console.log(`${repos[i]}`)
    }
}




function cache(req, res, next) {
    const {username} = req.body.name;

    client.get(username, (err, data) => {
        if(err) throw err;

        if(data != null) {
            res.send(setResponse(username, data));
        }
        else {
            next;
        }
    });
}

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
})