const libPackage = require('../package.json');
const libFableServiceProviderBase = require('fable-serviceproviderbase');

class PictServiceProviderBase extends libFableServiceProviderBase
{
	// The constructor can be used in two ways:
	// 1) With a fable, options object and service hash (the options object and service hash are optional)
	// 2) With an object or nothing as the first parameter, where it will be treated as the options object
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		/** @type {Object} */
		this._PackagePictServiceProvider = libPackage;
	}

	connectFable(pFable)
	{
		super.connectFable(pFable);

		if (!this.pict)
		{
			this.pict = pFable;
		}
		return true;
	}
}

module.exports = PictServiceProviderBase;
// This is left here in case we want to go back to having different code/base class for "core" services
module.exports.CoreServiceProviderBase = PictServiceProviderBase;