import { prepareKey, encrypt, decrypt, encryptAsync, decryptAsync } from "./lib";
import assert from "assert";
import { randomBytes } from "crypto";


const testUtilsPrepareKey = () => {
    const expected1 = Buffer.alloc(32).fill(0);
    const actual1 = prepareKey(Buffer.from([]));
    assert.deepStrictEqual(actual1, expected1);

    const expected2 = Buffer.concat([
        Buffer.from([1, 2, 3, 4]),
        Buffer.alloc(28).fill(0)
    ]);
    const actual2 = prepareKey(Buffer.from([1, 2, 3, 4]));
    assert.deepStrictEqual(actual2, expected2);

    const expected3 = randomBytes(32);
    const actual3 = prepareKey(expected3);
    assert.deepStrictEqual(actual3, expected3);

    const tooLong4 = randomBytes(36);
    const expected4 = tooLong4.subarray(0, 32);
    const actual4 = prepareKey(expected4);
    assert.deepStrictEqual(actual4, expected4);
}

const testUtilEncryptAndDecrypt = () => {
    const message = Buffer.from("Hello, Francis!", "utf-8");
    const key = Buffer.from("This is a weak key");
    const e = encrypt(message, key);
    const d = decrypt(e, key);
    assert.deepStrictEqual(d, message);
}

const testAsync = async () => {
    const message = Buffer.from("Hello, Francis!", "utf-8");
    const key = Buffer.from("This is a weak key");

    // NOTE: We cannot test "encrypt" against "encryptAsync", because both
    // internally generate `iv` randomly.
    const encrypted = await encryptAsync(message, key);

    const decryptedSync = decrypt(encrypted, key);
    assert.deepStrictEqual(decryptedSync, message);

    const decryptedAsync = await decryptAsync(encrypted, key);
    assert.deepStrictEqual(decryptedAsync, message);
}

const testAll = async () => {
    testUtilsPrepareKey();
    testUtilEncryptAndDecrypt();
    await testAsync();
}

testAll().catch(e => {
    console.error(e);
    process.exit();
});