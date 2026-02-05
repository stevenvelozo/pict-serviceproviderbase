# Creating Services

This guide covers how to create custom services using Pict-ServiceProviderBase.

## Basic Service

The simplest way to create a service is to extend the base class:

```javascript
const libPictServiceProviderBase = require('pict-serviceproviderbase');

class SimpleService extends libPictServiceProviderBase
{
    constructor(pPict, pOptions, pServiceHash)
    {
        super(pPict, pOptions, pServiceHash);
        this.serviceType = 'SimpleService';
    }

    doSomething()
    {
        this.pict.log.info(`SimpleService ${this.UUID}::${this.Hash} is doing something.`);
    }
}

module.exports = SimpleService;
```

## Constructor Parameters

The constructor receives three parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `pPict` | object | The Pict instance (also accessible as `this.pict`) |
| `pOptions` | object | Configuration options for this service instance |
| `pServiceHash` | string | Unique identifier for this service instance |

## Accessing Pict Services

Once your service is instantiated, you have access to all Pict services:

```javascript
class MyService extends libPictServiceProviderBase
{
    constructor(pPict, pOptions, pServiceHash)
    {
        super(pPict, pOptions, pServiceHash);
        this.serviceType = 'MyService';
    }

    example()
    {
        // Logging
        this.pict.log.info('Information message');
        this.pict.log.error('Error message');

        // Settings
        const setting = this.pict.settings.MyOption;

        // UUID generation
        const newId = this.pict.getUUID();

        // Application data
        this.pict.AppData.myValue = 'something';

        // Templating
        const result = this.pict.parseTemplate('Hello {~Data:Name~}', { Name: 'World' });
    }
}
```

## Service Properties

Every service instance has these properties:

| Property | Type | Description |
|----------|------|-------------|
| `pict` | object | Reference to the Pict instance |
| `fable` | object | Reference to the Fable instance |
| `options` | object | Configuration options |
| `UUID` | string | Unique identifier for this instance |
| `Hash` | string | Service hash identifier |
| `serviceType` | string | Type name of this service |
| `log` | object | Shortcut to logging (via Pict) |

## Registering Services

Register your service type with Pict before instantiating:

```javascript
const libPict = require('pict');
const MyService = require('./MyService');

// Add the service type
libPict.addServiceType('MyService', MyService);

// Create Pict instance
const _Pict = new libPict();

// Instantiate with options
const myService = _Pict.instantiateServiceProvider('MyService', {
    customOption: 'value'
}, 'my-service-instance');
```

## Core Pre-initialization Services

For services that must exist before Pict is fully initialized, use the `connectFable` method:

```javascript
class CoreService extends libPictServiceProviderBase
{
    constructor(pPict, pOptions, pServiceHash)
    {
        super(pPict, pOptions, pServiceHash);
        this.serviceType = 'CoreService';

        // Note: this.pict may not be fully initialized here
    }

    connectFable(pFable)
    {
        super.connectFable(pFable);
        // Now this.pict is fully connected
        this.pict.log.info('CoreService connected');
        return true;
    }
}
```

## Best Practices

1. **Always set serviceType** - This helps with debugging and service identification
2. **Use this.pict.log** - For consistent logging across your application
3. **Store configuration in options** - Pass settings through the options object
4. **Use meaningful Hash values** - Makes it easier to identify service instances
