export class PythiaUser {

	constructor(salt, deblindedPassword, version) {
		this.salt = salt;
		this.deblindedPassword = deblindedPassword;
		this.version = version;
	}

	toJSON() {
		return {
			salt: this.salt.toString('base64'),
			deblindedPassword: this.deblindedPassword.toString('base64'),
			version: this.version
		};
	}
}
