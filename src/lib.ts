import * as crypto from "crypto";
import { read } from "read";

// [Node.js - crypto module API docs](https://nodejs.org/docs/latest-v20.x/api/crypto.html)

const ALGORITHM: string = "aes-256-cbc";
const IV_SIZE: number = 16;
const KEY_SIZE: number = 32;

/**
 * A utility function that takes a {@link Buffer} as argument and checks whether
 * it is of size 32 bytes (i.e., 256 bits). If it is 32 bytes, it clones it and
 * returns it. If it is less than 32 bytes, it clones it and pads it to the
 * right with zeros to make it 32 bytes. If it is more than 32 bytes, it makes
 * a clone of the first 32 bytes and returns it.
 * 
 * @param key A {@link Buffer} instance (used as a password in this context).
 * 
 * @returns A 256-bit {@link Buffer} instance containing the first 32 bytes of `key` if
 * `key` is 32-bytes or more, else a copy of `key`'s bytes with extra zeros to the right.
 * 
 * @note This function is used internally by {@link encrypt}, {@link encryptAsync},
 * {@link decrypt}, and {@link decryptAsync} to prepare the password before encrypting
 * and decrypting.
 */
export const prepareKey = (key: Buffer): Buffer => {
    if (key.length >= KEY_SIZE) {
        return key.subarray(0, KEY_SIZE);
    }
    const zeros = Buffer.alloc(KEY_SIZE - key.length).fill(0);
    return Buffer.concat([key, zeros]);
}

/**
 * A function that can be used to encrypt arbitrary data using the `AES-256-CBC` algorithm.
 * 
 * @param data The {@link Buffer} instance or {@link String} containing the data to 
 * be encrypted.
 * 
 * @param key A {@link Buffer} instance containing the key to be used by the `AES-256-CBC` algorithm
 * for encrypting `data`. Ideally, that buffer would be of size 32 bytes, but, internally, this function will
 * prepare the `key` with {@link prepareKey} in order to make it 32 bytes. This allows for passwords of
 * arbitrary sizes, even if shorter passwords are less secure.
 * 
 * @returns A {@link Buffer} instance containing the encrypted data, prepended by an internally randomly
 * generated 128-bit (i.e., 16 bytes) initialization vector.
 * 
 * @note Internally, this function uses {@link https://nodejs.org/docs/latest-v20.x/api/crypto.html#class-cipher | Node's crypto.Cipher class}
 * to perform encryption.
 * 
 * @remark Encrypting the same data twice using the same password will yield different outputs, as the
 * initialization vector is randomly generated on each call.
 * 
 * @see {@link encryptAsync}
 */
export const encrypt = (data: string | Buffer, key: Buffer): Buffer => {
    const iv = crypto.randomBytes(IV_SIZE);
    const cipher = crypto.createCipheriv(ALGORITHM, prepareKey(key), iv);
    const encrypted = cipher.update(data);
    return Buffer.concat([iv, encrypted, cipher.final()]);
}

/**
 * Similar to {@link encrypt}, but asynchronous, this is a function that can be used
 * to encrypt arbitrary data using the `AES-256-CBC` algorithm.
 * 
 * @param data The {@link Buffer} instance or {@link String} containing the data to 
 * be encrypted.
 * 
 * @param key A {@link Buffer} instance containing the key to be used by the `AES-256-CBC` algorithm
 * for encrypting `data`. Ideally, that buffer would be of size 32 bytes, but, internally, this function will
 * prepare the `key` with {@link prepareKey} in order to make it 32 bytes. This allows for passwords of
 * arbitrary sizes, even if shorter passwords are less secure.
 * 
 * @returns A {@link Promise} that resolves to a {@link Buffer} instance containing the encrypted data,
 * prepended by an internally randomly generated 128-bit (i.e., 16 bytes) initialization vector.
 * 
 * @note Internally, this function uses {@link https://nodejs.org/docs/latest-v20.x/api/crypto.html#class-cipher | Node's crypto.Cipher class}
 * to perform encryption.
 * 
 * @remark Encrypting the same data twice using the same password will yield different outputs, as the
 * initialization vector is randomly generated on each call.
 * 
 * @see {@link encrypt}
 */
export const encryptAsync = async (data: string | Buffer, key: Buffer): Promise<Buffer> => {
    const iv = await new Promise((resolve: (buffer: Buffer) => void, reject) => {
        crypto.randomBytes(IV_SIZE, (error, buffer) => {
            if (error) reject(error);
            else resolve(buffer);
        });
    });
    const cipher = crypto.createCipheriv(ALGORITHM, prepareKey(key), iv);
    return new Promise((resolve, reject) => {
        let buffers: Buffer[] = [Buffer.from(iv)];
        cipher.on("data", data => {
            buffers.push(data);
        });
        cipher.on("end", () => {
            resolve(Buffer.concat(buffers));
        });
        cipher.on("error", error => {
            reject(error);
        });
        cipher.write(data);
        cipher.end();
    });
}

/**
 * A function that can be used to decrypt data that has been encrypted using this library's
 * {@link encrypt} or {@link encryptAsync} function, both of which are based on the `AES-256-CBC`
 * algorithm.
 * 
 * @param encryptedData The {@link Buffer} instance containing the encrypted data.
 * 
 * @param key A {@link Buffer} instance containing the same key that was used when encrypting the data
 * using {@link encrypt} or {@link encryptAsync}.
 * 
 * @returns A {@link Buffer} instance containing the decrypted data.
 * 
 * @note Internally, this function uses {@link https://nodejs.org/docs/latest-v20.x/api/crypto.html#class-decipher | Node's crypto.Decipher class}
 * to perform decryption.
 * 
 * @note This function assumes that the encrypted data has been generated using either {@link encrypt} or
 * {@link encryptAsync}, which two functions randomly generate a 128-bit initialization vector used for
 * encrypting, and then prepend that initialization vector to the encrypted data before returning
 * everything into a {@link Buffer}.
 * 
 * @see {@link decryptAsync}
 */
export const decrypt = (encryptedData: Buffer, key: Buffer): Buffer => {
    const iv = encryptedData.subarray(0, IV_SIZE);
    const data = encryptedData.subarray(IV_SIZE);
    const decipher = crypto.createDecipheriv(ALGORITHM, prepareKey(key), iv);
    return Buffer.concat([decipher.update(data), decipher.final()]);
}

/**
 * Similar to {@link decrypt}, but asynchronous, this is a function that can be used to decrypt
 * data that has been encrypted using this library's {@link encrypt} or {@link encryptAsync} function,
 * both of which are based on the `AES-256-CBC` algorithm.
 * 
 * @param encryptedData The {@link Buffer} instance containing the encrypted data.
 * 
 * @param key A {@link Buffer} instance containing the same key that was used when encrypting the data
 * using {@link encrypt} or {@link encryptAsync}.
 * 
 * @returns A {@link Promise} that resolves to a {@link Buffer} instance containing the decrypted data.
 * 
 * @note Internally, this function uses {@link https://nodejs.org/docs/latest-v20.x/api/crypto.html#class-decipher | Node's crypto.Decipher class}
 * to perform decryption.
 * 
 * @note This function assumes that the encrypted data has been generated using either {@link encrypt} or
 * {@link encryptAsync}, which two functions randomly generate a 128-bit initialization vector used for
 * encrypting, and then prepend that initialization vector to the encrypted data before returning
 * everything into a {@link Buffer}.
 * 
 * @see {@link decrypt}
 */
export const decryptAsync = (encryptedData: Buffer, key: Buffer): Promise<Buffer> => {
    const iv = encryptedData.subarray(0, IV_SIZE);
    const data = encryptedData.subarray(IV_SIZE);
    const decipher = crypto.createDecipheriv(ALGORITHM, prepareKey(key), iv);
    return new Promise((resolve, reject) => {
        let buffers: Buffer[] = [];
        decipher.on("data", data => {
            buffers.push(data);
        });
        decipher.on("end", () => {
            resolve(Buffer.concat(buffers));
        });
        decipher.on("error", error => {
            reject(error);
        });
        decipher.write(data);
        decipher.end();
    });
}

/**
 * A function that can be used to prompt the user for a password in the terminal. The
 * input will be hidden as the user type (i.e., the input will be `TTY`).
 * 
 * @param prompt An optional text message to show as prompt for the user's input.
 * 
 * @note This function uses the {@link https://github.com/npm/read | read} package internally.
 * 
 * @returns A {@link Promise} that resolves to a string containing the user's input.
 */
export const requestPassword = (prompt?: string): Promise<string> => {
    return read({
        prompt,
        silent: true,
        replace: "*"
    });
}

/**
 * A function that can be used to prompt the user for an arbitrary text input.
 * 
 * @param prompt An optional text message to show as prompt for the user's input.
 * 
 * @note This function uses the {@link https://github.com/npm/read | read} package internally.
 * 
 * @returns A {@link Promise} that resolves to a string containing the user's input.
 */
export const requestInput = (prompt?: string): Promise<string> => {
    return read({ prompt });
}

/**
 * A function that can be used to prompt the user for a confirmation.
 * 
 * @param prompt A string containing the question to be asked to the user.
 * 
 * @param yes An optional array of strings containing values that will be treated as a 'yes'.
 * If none provided, `["yes", "y"]` will be used as default.
 *
 * @returns A {@link Promise} that resolves to a boolean value indicating whether the
 * user accepted or declined.
 * 
 * @note For convenience, the values in `yes` as well as the user input will be
 * converted to lowercase before the condition gets evaluated. For instance, if the 
 * user input is 'OUI', but `yes = ['oui']`, a positive result will still be 
 * obtained.
 * 
 * @note This function uses the {@link https://github.com/npm/read | read} package internally.
 */
export const askQuestion = async (prompt: string, yes: string[] = ["yes", "y"]): Promise<boolean> => {
    const result = await read({
        prompt,
        default: yes.join("/")
    });
    return yes.map(y => y.toLocaleLowerCase()).includes(result.toLocaleLowerCase());
}

// /**
//  * A re-exportation of all public functions as a `default` object. This
//  * can be useful if the user prefers to use this library's functions
//  * while keeping them inside a namespace.
//  * 
//  * @example
//  * ```ts
//  * import simpleEncryption from "@bb301/simple-encryption-util";
//  * ```
//  */
// export default Object.freeze({
//     prepareKey,
//     encrypt,
//     decrypt,
//     encryptAsync,
//     decryptAsync,
//     requestPassword,
//     askQuestion,
//     requestInput
// });