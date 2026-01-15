/**
* Unit tests for Pict Service Provider Base
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*/

const libPict = require('pict');
const libPictServiceProviderBase = require('../source/Pict-ServiceProviderBase.js');

const Chai = require("chai");
const Expect = Chai.expect;

class SimpleService extends libPictServiceProviderBase
{
	constructor(pPict, pOptions, pServiceHash)
	{
		super(pPict, pOptions, pServiceHash);

		this.serviceType = 'SimpleService';
	}

	doSomething()
	{
		// Exercise something that is only in pict and not fable as well
		this.pict.log.trace(`There are ${Object.keys(this.pict.providers).length} service providers registered in pict.`);
		this.pict.log.info(`SimpleService ${this.UUID}::${this.Hash} is doing something.`);
	}
}

class MockDatabaseService extends libPictServiceProviderBase
{
	constructor(pPict, pOptions, pServiceHash)
	{
		super(pPict, pOptions, pServiceHash);

		this.serviceType = 'MockDatabaseService';
	}

	connect()
	{
		this.pict.log.info(`MockDatabaseService ${this.UUID}::${this.Hash} is connecting to a database.`);
	}

	commit(pRecord)
	{
		this.pict.log.info(`MockDatabaseService ${this.UUID}::${this.Hash} is committing a record ${pRecord}.`);
	}
}

class MockCoreService extends libPictServiceProviderBase.CoreServiceProviderBase
{
	constructor(pOptions, pServiceHash)
	{
		super(pOptions, pServiceHash);

		this.serviceType = 'MockCoreService';

		
	}

	// Core services should be able to provide their behaviors before the Pict object is fully initialized.
	magicBehavior(pData)
	{
		console.log(`MockCoreService ${this.UUID}::${this.Hash} is doing something magical with ${pData}.`);
	}
}

suite
(
	'Pict Service Manager',
	function()
	{
		var testPict = false;

		setup
		(
			function()
			{
			}
		);

		suite
		(
			'Service Manager',
			function()
			{
				test
				(
					'Manually initialize a Service',
					function()
					{
						testPict = new libPict();

						let tmpSimpleService = new SimpleService(testPict, {SomeOption: true});

						tmpSimpleService.doSomething();

						Expect(tmpSimpleService.Hash).to.be.a('string');

						Expect(tmpSimpleService._PackagePictServiceProvider).to.be.an('object');
						Expect(tmpSimpleService._PackagePictServiceProvider.name).to.equal('pict-serviceproviderbase');
						Expect(tmpSimpleService._PackagePictServiceProvider.version)
					}
				);
				test
				(
					'Register a Service',
					function()
					{
						testPict = new libPict();
						testPict.serviceManager.addServiceType('SimpleService');
						testPict.serviceManager.instantiateServiceProvider('SimpleService', {SomeOption: true}, 'SimpleService-123');

						Expect(testPict.serviceManager.servicesMap['SimpleService']['SimpleService-123']).to.be.an('object');
					}
				);
				test
				(
					'Use the Default Service',
					function()
					{
						testPict = new libPict();
						testPict.serviceManager.addServiceType('SimpleService', SimpleService);
						let tmpSimpleService = testPict.serviceManager.instantiateServiceProvider('SimpleService', {SomeOption: true}, 'SimpleService-123');

						Expect(testPict.serviceManager.servicesMap['SimpleService']['SimpleService-123']).to.be.an('object');

						// The passed-in magic stuff should work too.
						tmpSimpleService.log.info(`There were almost ${tmpSimpleService.services.DataFormat.formatterDollars(9821229.37)} dollars just lying here!`);

						Expect(testPict.serviceManager.servicesMap['SimpleService']).to.be.an('object');

						testPict.serviceManager.services.SimpleService.doSomething();

						Expect(testPict.serviceManager.services['SimpleService'].Hash).to.equal('SimpleService-123');
					}
				);
				test
				(
					'Use the Default Service with a different hash',
					function()
					{
						let testPict = new libPict({});

						testPict.serviceManager.addServiceType('SimpleService', SimpleService);

						testPict.serviceManager.instantiateServiceProvider('SimpleService', {SomeOption: true}, 'SimpleService-13');

						testPict.serviceManager.servicesMap['SimpleService']['SimpleService-13'].doSomething();

						Expect(testPict.serviceManager.servicesMap['SimpleService']['SimpleService-13']).to.be.an('object');
					}
				);

				test
				(
					'Instantiate a service without registering it to Pict',
					function()
					{
						let testPict = new libPict({});

						testPict.serviceManager.addServiceType('SimpleService', SimpleService);

						let tmpService = testPict.serviceManager.instantiateServiceProviderWithoutRegistration('SimpleService', {SomeOption: true}, 'SimpleService-99');

						Expect(testPict.servicesMap.SimpleService['SimpleService-99']).to.be.an('undefined');

						Expect(tmpService).to.be.an('object');
					}
				);

				test
				(
					'Change the default service provider',
					function()
					{
						let testPict = new libPict({});

						testPict.serviceManager.addServiceType('SimpleService', SimpleService);
						testPict.serviceManager.addServiceType('DatabaseService', MockDatabaseService);

						testPict.serviceManager.instantiateServiceProvider('SimpleService', {SomeOption: true});
						testPict.serviceManager.services.SimpleService.doSomething();

						testPict.serviceManager.instantiateServiceProvider('DatabaseService', {ConnectionString: 'mongodb://localhost:27017/test'}, 'PrimaryConnection');

						Expect(testPict.serviceManager.services.DatabaseService.Hash).to.equal('PrimaryConnection');

						testPict.serviceManager.instantiateServiceProvider('DatabaseService', {ConnectionString: 'mongodb://localhost:27017/test'}, 'SecondaryConnection');

						Expect(testPict.serviceManager.services.DatabaseService.Hash).to.equal('PrimaryConnection');

						testPict.serviceManager.services.DatabaseService.connect();
						testPict.serviceManager.services.DatabaseService.commit('Test Record');

						testPict.serviceManager.setDefaultServiceInstantiation('DatabaseService', 'SecondaryConnection');

						testPict.serviceManager.services.DatabaseService.connect();
						testPict.serviceManager.services.DatabaseService.commit('Another Test Record');

						Expect(testPict.serviceManager.services.DatabaseService.Hash).to.equal('SecondaryConnection');
					}
				);

				test
				(
					'Construct a core service before Pict is initialized',
					function()
					{
						let tmpCoreService = new MockCoreService({SomeOption: true});

						Expect(tmpCoreService).to.be.an('object');

						tmpCoreService.magicBehavior('MAGICTESTDATA');
					}
				)
				test
				(
					'Construct a core service with a hash before Pict is initialized',
					function()
					{
						let tmpCoreService = new MockCoreService({SomeOption: true}, 'MockCoreService-1');

						Expect(tmpCoreService).to.be.an('object');
						Expect(tmpCoreService.Hash).to.equal('MockCoreService-1');

						tmpCoreService.magicBehavior('MAGICTESTDATA');
					}
				)

				test
				(
					'Construct a core service and attach it to Pict after Pict is initialized',
					function()
					{

						let tmpCoreService = new MockCoreService({SomeOption: true}, 'MockCoreService-2');

						Expect(tmpCoreService).to.be.an('object');
						Expect(tmpCoreService.Hash).to.equal('MockCoreService-2');

						let testPict = new libPict({});

						testPict.serviceManager.connectPreinitServiceProviderInstance(tmpCoreService);

						Expect(testPict.servicesMap.MockCoreService['MockCoreService-2']).to.be.an('object');
						Expect(testPict.services.MockCoreService).to.be.an('object');

						Expect(testPict.services.MockCoreService.pict.log).to.be.an('object');
					}
				)

				test
				(
					'Construct a service without a pict at all',
					function()
					{
						let tmpService = new SimpleService({Setting:'Something'});

						Expect(tmpService.options.Setting).to.equal('Something');
						Expect(tmpService.UUID).to.be.a('string');
					}
				)

				test
				(
					'Attempt to change the default service provider to a nonexistant provider',
					function()
					{
						let testPict = new libPict({});

						testPict.serviceManager.addServiceType('SimpleService', SimpleService);
						testPict.serviceManager.addServiceType('DatabaseService', MockDatabaseService);

						testPict.serviceManager.instantiateServiceProvider('SimpleService', {SomeOption: true});
						testPict.serviceManager.services.SimpleService.doSomething();

						testPict.serviceManager.instantiateServiceProvider('DatabaseService', {ConnectionString: 'mongodb://localhost:27017/test'}, 'PrimaryConnection');

						Expect(testPict.serviceManager.services.DatabaseService.Hash).to.equal('PrimaryConnection');

						testPict.serviceManager.instantiateServiceProvider('DatabaseService', {ConnectionString: 'mongodb://localhost:27017/test'}, 'SecondaryConnection');

						Expect(testPict.serviceManager.services.DatabaseService.Hash).to.equal('PrimaryConnection');

						testPict.serviceManager.services.DatabaseService.connect();
						testPict.serviceManager.services.DatabaseService.commit('Test Record');

						Expect(testPict.serviceManager.setDefaultServiceInstantiation('DatabaseService', 'TertiaryConnection')).to.be.false;

						testPict.serviceManager.services.DatabaseService.connect();
						testPict.serviceManager.services.DatabaseService.commit('Another Test Record');

						Expect(testPict.serviceManager.services.DatabaseService.Hash).to.equal('PrimaryConnection');
					}
				);
			}
		);
	}
);