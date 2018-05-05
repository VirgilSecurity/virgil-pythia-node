# Virgil Pythia Node.js SDK
[![GitHub license](https://img.shields.io/badge/license-BSD%203--Clause-blue.svg)](https://github.com/VirgilSecurity/virgil/blob/master/LICENSE)


[Introduction](#introduction) | [SDK Features](#sdk-features) | [Install and configure SDK](#install-and-configure-sdk) | [Usage Examples](#usage-examples) | [Docs](#docs) | [Support](#support)

## Introduction

<a href="https://developer.virgilsecurity.com/docs"><img width="230px" src="https://cdn.virgilsecurity.com/assets/images/github/logos/virgil-logo-red.png" align="left" hspace="10" vspace="6"></a>[Virgil Security](https://virgilsecurity.com) provides an SDK which lets you implement Pythia protocol.
Pythia is a technology that gives you a new, more secure mechanism that "breach-proofs" user passwords and lessens the security risks associated with weak passwords by providing cryptographic leverage for the defender (by eliminating offline password cracking attacks), detection for online attacks, and key rotation to recover from stolen password databases.

## SDK Features
- communicate with Virgil Pythia Service
- manage your Pythia application credentials
- create, verify and update user's breach-proof password
- use [Virgil Crypto Pythia library][_virgil_crypto_pythia]

## Install and configure SDK

The Virgil Pythia Node.js SDK is provided as a package named virgil-pythia. The package is distributed via npm.
The package is available for Node.js 6 or newer.

Install Pythia SDK with the following code:
```bash
npm install --save virgil-pythia
```

### Configure SDK

When you create a Pythia Application on the [Virgil Dashboard][_dashboard] you will receive Application credentials including: Proof Key and App ID. Specify your Pythia Application and Virgil account credentials in a Pythia SDK class instance.
These credentials are used for the following purposes:
- generating a JWT token that is used for authorization on the Virgil Services
- creating a user's breach-proof password

Here is an example of how to specify your credentials:

```javascript
import { createPythia } from 'virgil-pythia';

const pythia = createPythia({
	apiKeyBase64: process.env.VIRGIL_API_KEY,
	apiKeyId: process.env.VIRGIL_API_KEY_ID,
	appId: process.env.VIRGIL_APP_ID,
	proofKeys: process.env.MY_PROOF_KEY
});
```

## Usage Examples

Virgil Pythia SDK lets you easily create, verify and update user's breach-proof password using Virgil Crypto library.

First of all, you need to set up your database to store users' breach-proof passwords. Create additional columns in your database for storing the following parameters:
<table class="params">
<thead>
		<tr>
			<th>Parameters</th>
			<th>Type</th>
			<th>Size (bytes)</th>
			<th>Description</th>
		</tr>
</thead>

<tbody>
<tr>
	<td>salt</td>
	<td>blob</td>
	<td>32</td>
	<td> Unique random string that is generated by Pythia SDK for each user</td>
</tr>

<tr>
	<td>deblindedPassword</td>
	<td>blob </td>
	<td>384 </td>
	<td>user's breach-proof password</td>
</tr>

<tr>
	<td>version</td>
	<td>int </td>
	<td>4 </td>
	<td>Version of your Pythia Application credentials. This parameter has the same value for all users unless you generate new Pythia credentials on Virgil Dashboard</td>
</tr>

</tbody>
</table>

Now we can start creating breach-proof passwords for users. Depending on the situation, you will use one of the following Pythia SDK functions:
- `createBreachProofPassword` is used to create a user's breach-proof password (e.g. during registration).
- `verifyBreachProofPassword` is used to verify a user's breach-proof password (e.g. during authentication).

### Create Breach-Proof Password

Use this flow to create a new breach-proof password for a user.

> Remember, if you already have a database with user passwords, you don't have to wait until a user logs in into your system to implement Pythia.
You can go through your database and create breach-proof user passwords at any time.

So, in order to create a user's breach-proof password for a new database or existing one, take the following actions:
- Take a user's password (or its hash or whatever you use) and pass it into the `createBreachProofPassword` function.
- Pythia SDK will blind the password, send a request to Pythia Service to get a transformed blinded password and de-blind the transformed blinded password into a user's deblinded password (breach-proof password).

```javascript
// create a new Breach-proof password using user's password or its hash
pythia.createBreachProofPassword('USER_PASSWORD')
	.then(bpPassword => {
		// save the breach-proof password parameters into your database
        fmt.Println(pwd.Salt, pwd.DeblindedPassword, pwd.Version)
        console.log(bpPassword.salt.toString('base64')); // salt is a Buffer
        console.log(bpPassword.deblindedPassword.toString('base64')); // deblindedPassword is a Buffer
        console.log(bpPassword.version);
	});
```

The result of calling `createBreachProofPassword` is an object containing parameters mentioned previously (`salt`, `deblindedPassword`, `version`),
save these parameters into corresponding columns in your database.

Check that you've updated all database records and delete the now unnecessary column where users' passwords were previously stored.

### Verify Breach-Proof Password

Use this flow when you need to verify that the user-provided plaintext password matches the breach-proof password stored
in your database. You will have to pass their plaintext password into the `verifyBreachProofPassword` function:

```javascript
import { BreachProofPassword } from 'virgil-pythia';

// get user's Breach-proof password parameters from your users DB
// ...
// assuming user is the object representing your database record
const bpPassword = new BreachProofPassword(user.salt, user.deblindedPassword, user.version);

// calculate user's Breach-proof password parameters
// compare these parameters with parameters from your DB
pythia.verifyBreachProofPassword('USER_PASSWORD', bpPassword, false)
	.then(verified => {
		console.log(verified); // true if the plaintext password matches the stored one, otherwise false
	});
```

The difference between the `verifyBreachProofPassword` and `createBreachProofPassword` functions is that the
verification of Pythia Service's response is optional in `verifyBreachProofPassword` function, which allows you
to achieve maximum performance when processing data. You can turn on the proof step in `verifyBreachProofPassword`
function if you have any suspicions that a user or Pythia Service were compromised.

### Update breach-proof passwords

This step will allow you to use an `updateToken` in order to update users' breach-proof passwords in your database.

> Use this flow only if your database was COMPROMISED.

How it works:
- Open your Pythia app page in Virgil Dashboard and press the "My Database Was Compromised" button.
- Pythia Service generates a special updateToken and new Proof Key.
- You then specify new Pythia Application credentials in the Pythia SDK on your Server side.
- Then you use `updateBreachProofPassword` function to create new breach-proof passwords for your users.
- Finally, you save the new breach-proof passwords into your database.

Here is an example of using the `updateBreachProofPassword` function:
```javascript
//get previous user's breach-proof password parameters from a compromised DB

// ...

// set up an updateToken that you got on the Virgil Dashboard
// update previous user's deblindedPassword and version, and save new one into your DB

const updatedBpPassword = pythia.updateBreachProofPassword('UT.1.2.UPDATE_TOKEN', bpPassword);
console.log(updatedBpPassword.deblindedPassword.toString('base64'));
console.log(updatedBpPassword.version);
```

## Docs
Virgil Security has a powerful set of APIs, and the documentation below can get you started today.

* [Breach-Proof Password][_pythia_use_case] Use Case
* [The Pythia PRF Service](https://eprint.iacr.org/2015/644.pdf) - foundation principles of the protocol
* [Virgil Security Documenation][_documentation]

## License

This library is released under the [3-clause BSD License](LICENSE.md).

## Support
Our developer support team is here to help you. Find out more information on our [Help Center](https://help.virgilsecurity.com/).

You can find us on [Twitter](https://twitter.com/VirgilSecurity) or send us email support@VirgilSecurity.com.

Also, get extra help from our support team on [Slack](https://virgilsecurity.slack.com/join/shared_invite/enQtMjg4MDE4ODM3ODA4LTc2OWQwOTQ3YjNhNTQ0ZjJiZDc2NjkzYjYxNTI0YzhmNTY2ZDliMGJjYWQ5YmZiOGU5ZWEzNmJiMWZhYWVmYTM).

[_virgil_crypto_pythia]: https://github.com/VirgilSecurity/pythia
[_pythia_use_case]: https://developer.virgilsecurity.com/docs/go/use-cases/v5/breach-proof-password
[_documentation]: https://developer.virgilsecurity.com/
[_dashboard]: https://dashboard.virgilsecurity.com/
