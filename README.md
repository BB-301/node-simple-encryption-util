# Simple Node.js Encryption Utility

A simple Node.js library (written in TypeScript) and accompanying CLI tool for encrypting and decrypting data using the AES-256 CBC algorithm.

## Context (why I wrote this package)

I wrote this simple package because I needed a quick and easy way to store credentials such as API keys and crypto wallet seed phrases on my development machine without having to keep them inside plain text files. In fact, my pain point was two-fold: 

* First, I wanted my Node.js scripts to prompt me for a password when it was time to decrypt the sensible information at runtime. This is what this package's library's core functions (i.e., `encrypt`, `encryptAsync`, `decrypt`, and `decryptAsync`) are for.

* Secondly, I needed a simple program allowing me to manually encrypt the sensible information from a terminal, without having to store the data inside a file at any point during the encryption process. This is what this package's CLI (i.e., the `prompt-encrypt` command) is for.

## How to install

The recommended way of installing this package is through the NPM registry.

### Project scope

#### To use the CLI

```shell
# Install the package
npm install --save-dev @bb301/simple-encryption-util

# Use the CLI inside the current NPM project
npx prompt-encrypt
```

#### To use the library inside a Node.js project

```shell
npm install --save @bb301/simple-encryption-util
```
### Global scope (for the CLI)

```shell
# Install globally
npm install -g @bb301/simple-encryption-util

# Use the CLI from anywhere
prompt-encrypt
```

## How it works

This library's core functions are `encrypt` and `decrypt` (which also have `async` equivalents; i.e., `encryptAsync` and `decryptAsync`, respectively), and they are based on the `AES-256 CBC algorithm` made available by [Node's crypto module](https://nodejs.org/docs/latest-v20.x/api/crypto.html#class-cipher).

The library functions are declared inside [src/lib.ts](https://github.com/BB-301/node-simple-encryption-util/blob/main/src/lib.ts), and they are all carefully documented. The user should read the [documentation](https://bb-301.github.io/node-simple-encryption-util-docs/) and inspect the [source code](https://github.com/BB-301/node-simple-encryption-util/blob/main/src/lib.ts) before using this library in a project.

This package also includes a CLI named `prompt-encrypt` that can be used to start an interactive terminal that will prompt the user for a password and for the secret message to be encrypted. The result will be outputted to the terminal as an hexadecimal string, but the user will also be offered the possibility to save the result inside a text file.

Below are three examples illustrating [(1)](#example-1-using-the-cli) how to use the CLI to encrypt a secret message, [(2)](#example-2-using-the-library) how to use the `encrypt` and `decrypt` library functions in a Node script, and [(3)](#example-3-using-the-library) how to use the utility function `requestPassword` along with `decryptAsync` in order to decrypt a secret message at runtime.

### Example 1: Using the CLI

This is a simple example that illustrates how to use the `prompt-encrypt` CLI
command to encrypt a secret message using a password. `prompt-encrypt` will
initialize a simple interactive terminal that will prompt the user twice for a password (to
make sure no input errors are made), and then twice for the secret message 
(again, to make sure no input errors are made). At the end, the CLI
will print the encrypted message, and ask the user whether the user would like to
save the encrypted message to a file as well. In this example, we decline and
the interactive terminal session ends.

```shell
prompt-encrypt
#
# This is a simple CLI tool based on the AES-256 CBC algorithm.
# [read more](https://github.com/BB-301/node-simple-encryption-util)
#
# Enter password: ****
# Enter password again: ****
#
# Enter message: *****
# Enter message again: *****
#
# Here's your hex-encoded encrypted message:
# 
# 10f1315f6ff11b87be9654ce4c23a342032145bc8c6c6d4b72b02d6854a26a0a
#
# Would you like to save the encrypted message to a file? (yes/y) n

```

### Example 2: Using the library

The following example illustrates how this library's core functions `encrypt`
and `decrypt` can be used to encrypt and decrypt a message using a given 
password. Depending on the context, the user may prefer to use the asynchronous
versions of those two functions; i.e., `encryptAsync` and `decryptAsync`, respectively.

```ts
import assert from "assert";
import { encrypt, decrypt } from "@bb301/simple-encryption-util";

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
```

### Example 3: Using the library

This final example illustrates how the `requestPassword` utility function can
be used along with the `decryptAsync` function inside a script to prompt the
user for a password at runtime to decrypt a secret message.

```ts
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
```

## Disclaimer

I am not a cryptography expert, so I wouldn't necessarily know if there were anything wrong with my current implementation, although based on my research of the subject, I believe my implementation to be correct. So please make sure to review the source code before using this library (or CLI tool) in your project. And please let me know if you find anything that needs correcting in my implementation.

## Contact

If you have any questions, if you find bugs, or if you have suggestions for this project, please feel free to contact me by opening an issue on the [repository](https://github.com/BB-301/node-simple-encryption-util/issues).

## License

This project is released under the [MIT License](https://github.com/BB-301/node-simple-encryption-util/blob/main/LICENSE).

## Copyright

Copyright (c) 2024 BB-301 (fw3dg3@gmail.com)