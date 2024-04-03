import assert from "assert";
import { encrypt, decrypt } from "../lib";

const main = () => {
    const secretMessage: string = "This is a secret message";
    const password: string = "strong_password";

    const key = Buffer.from(password, "utf-8");

    const encrypted = encrypt(Buffer.from(secretMessage, "utf-8"), key);
    console.log(`Encrypted data: ${encrypted.toString("hex")}`);

    const decrypted = decrypt(encrypted, key).toString("utf-8");
    assert.deepStrictEqual(decrypted, secretMessage, "Decrypted message should match initial message");
    console.log(`Decrypted message: ${secretMessage}`);
}

main();