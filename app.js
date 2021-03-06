import express from "express";
import exphbs from "express-handlebars";
import bodyParser from "body-parser";
import fetch from "node-fetch";
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
app.use(bodyParser.urlencoded({extended: false}));

app.use(methodOverride("_method"));

app.get("/", (req, res, next) => {
    res.render("index");
})

app.post("/user/search", getGithubRepos);

async function getGithubRepos(req, res, next)  {
    try {
        console.log("Fetching...");

        const username= req.body.username;

        const response= await fetch(`https://api.github.com/users/${username}/repos`);

        const data = await response.json();
        
        res.render("index", {data});
    }
    catch(err) {
        console.log(err);
        res.status(500);
    }
}

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
})