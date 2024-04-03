import assert from "assert";
import { decryptAsync, requestPassword } from "../lib";

const EXPECTED_MESSAGE: string = "This is a secret message!";
const HEX_ENCRYPTED_MESSAGE: string = "0a2a0794611400aca0fa45e21e35c1131e600316802365b363db7008366e5bf2195929980d6136be8478686b7515792f";

const main = async () => {
    // NOTE: The password is 'weak_password'
    const password = await requestPassword("Please enter your password: ");

    const key = Buffer.from(password, "utf-8");
    const data = Buffer.from(HEX_ENCRYPTED_MESSAGE, "hex");

    const decryptedMessage = (await decryptAsync(data, key)).toString("utf-8");
    assert.deepStrictEqual(decryptedMessage, EXPECTED_MESSAGE);

    console.log(`The secret message is: ${decryptedMessage}\n`);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});