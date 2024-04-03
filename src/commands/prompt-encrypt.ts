#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { askQuestion, encrypt, requestInput, requestPassword } from "../lib";

const setColor = (color: "red" | "green" | "yellow" | "default") => {
    switch (color) {
        case "yellow":
            console.log("\x1b[33m");
            break;
        case "red":
            console.log("\x1b[31m");
            break;
        case "green":
            console.log("\x1b[32m");
            break;
        case "default":
            console.log("\x1b[0m");
            break;
        default: throw new Error(`Invalid color '${color}'`);
    }
}

const main = async () => {
    console.log(`\nThis is a simple encryption tool based on the AES-256 CBC algorithm.`);
    console.log(`[read more](https://github.com/BB-301/node-simple-encryption-util)\n`);

    let p1: string;
    while (true) {
        p1 = await requestPassword("Enter password: ");
        const p2 = await requestPassword("Enter password again: ");
        if (p1 !== p2) {
            setColor("red");
            console.log(`Passwords don't match. Try again.`);
            setColor("default");
            continue;
        }
        if (p1.length < 8) {
            setColor("yellow");
            const confirmation = await askQuestion(`Your password has character length ${p1.length}. Are you sure it's enough?`);
            setColor("default");
            if (confirmation) break;
        } else {
            console.log("");
            break;
        }
    }

    let m1: string;
    while (true) {
        m1 = await requestPassword("Enter message: ");
        const m2 = await requestPassword("Enter message again: ");
        if (m1 !== m2) {
            setColor("red");
            console.log(`Messages don't match. Try again.`);
            setColor("default");
            continue;
        }
        break;
    }

    const encrypted = encrypt(m1, Buffer.from(p1));
    console.log(`\nHere's your hex-encoded encrypted message:`)
    setColor("green");
    console.log(encrypted.toString("hex"));
    setColor("default");

    const saveToFile = await askQuestion("Would you like to save the encrypted message to a file?", ["yes", "y"]);
    console.log("");
    if (!saveToFile) {
        return;
    }

    while (true) {
        let filePath = await requestInput("Please specify a file path (leave empty to cancel): ");
        if (!filePath) break;
        filePath = path.resolve(filePath);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                setColor("red");
                console.log(`'${filePath}' is a directory`);
                setColor("default");
                continue;
            }
            setColor("yellow");
            const shouldOverride = await askQuestion(`'${filePath}' already exists. Do you want to override it?`, ["yes", "y"]);
            setColor("default");
            if (!shouldOverride) {
                continue;
            }
        }
        const fileDirectory = path.dirname(filePath);
        if (!fs.existsSync(fileDirectory)) {
            fs.mkdirSync(fileDirectory, { recursive: true });
        }
        fs.writeFileSync(filePath, encrypted.toString("hex"), { encoding: "utf-8" });
        console.log(`\nFile successfully saved:`);
        setColor("green");
        console.log(filePath);
        setColor("default");
        break;
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});