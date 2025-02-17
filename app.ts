require("dotenv").config();

import "reflect-metadata";
import {ConnectionOptions, createConnection} from "typeorm";
import express from "express";

const PORT = process.env.PORT || 3030;
const app = express();
const fileUpload = require("express-fileupload");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(cors({
	"origin": "*",
	"methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
	"preflightContinue": false,
	"optionsSuccessStatus": 204
}));

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(fileUpload({
	limits: {fileSize: 50 * 1024 * 1024}, //5MB
	useTempFiles: true,
	tempFileDir: "/tmp/",
	safeFileNames: true,
	preserveExtension: true,
	abortOnLimit: true,
	responseOnLimit: "File size can't be bigger than 5MB."
}));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const logger = require("morgan");
app.use(logger("dev"));

const connectionOptions: ConnectionOptions = {
	type: "postgres",
	port: parseInt(process.env.DB_PORT || "5432"),
	username: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB,
	synchronize: true,
	logging: false,
	entities: [
		"entity/**/*"
	],
	migrations: [
		"migration/**/*"
	],
	subscribers: [
		"subscriber/**/*"
	],
	cli: {
		"entitiesDir": "entity",
		"migrationsDir": "migration",
		"subscribersDir": "subscriber"
	}
};

createConnection(connectionOptions).then(_connection => {
	const indexRouter = require("./routes/index");
	const listRouter = require("./routes/list");
	const listItemRouter = require("./routes/list_item");
	const userRouter = require("./routes/user");

	app.use("/", indexRouter);
	app.use("/list", listRouter);
	app.use("/list/item", listItemRouter);
	app.use("/user", userRouter);

	app.listen(PORT, () => {
		console.log(`Server is listening on port ${PORT}`);
	});
}).catch(error => console.log(error));
