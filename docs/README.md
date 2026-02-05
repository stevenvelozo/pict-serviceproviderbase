# Pict-ServiceProviderBase

> Base class for creating Pict service providers

Pict-ServiceProviderBase provides a simple interface for building custom services that integrate with the Pict ecosystem. It extends the Fable service provider architecture, giving your services automatic access to logging, settings, and other core Pict functionality.

## Features

- **Simple Interface** - Minimal boilerplate for creating custom services
- **Pict Integration** - Automatic access to Pict instance and all its services
- **Fable Compatibility** - Built on fable-serviceproviderbase for consistent behavior
- **Lifecycle Support** - Hooks for initialization and connection phases
- **UUID & Hash** - Each service instance gets unique identifiers automatically
- **Logging Access** - Direct access to Pict's logging system

## Quick Start

```javascript
const libPictServiceProviderBase = require('pict-serviceproviderbase');

class MyService extends libPictServiceProviderBase
{
    constructor(pPict, pOptions, pServiceHash)
    {
        super(pPict, pOptions, pServiceHash);
        this.serviceType = 'MyService';
    }

    doSomething()
    {
        this.pict.log.info(`MyService ${this.UUID}::${this.Hash} is doing something.`);
    }
}

module.exports = MyService;
```

## Installation

```bash
npm install pict-serviceproviderbase
```

## Core Concepts

### Service Types

There are two types of services you can create:

1. **Basic Services** - Services that are instantiated after Pict is fully initialized. These have immediate access to all Pict functionality.

2. **Core Pre-initialization Services** - Services that need to be instantiated before Pict is fully initialized. These use deferred connection via `connectFable()`.

### Using Services with Pict

```javascript
const libPict = require('pict');

// Register your service type
libPict.addServiceType('MyService', MyService);

// Create Pict instance
const _Pict = new libPict();

// Instantiate your service
const myService = _Pict.instantiateServiceProvider('MyService', {
    // options here
}, 'my-service-hash');

// Use your service
myService.doSomething();
```

## Documentation

- [Creating Services](creating-services.md) - Guide to building custom services
- [API Reference](api-reference.md) - Complete API documentation

## Related Packages

- [pict](https://github.com/stevenvelozo/pict) - Core Pict framework
- [pict-view](https://github.com/stevenvelozo/pict-view) - View base class
- [pict-provider](https://github.com/stevenvelozo/pict-provider) - Provider base class with lifecycle hooks
- [fable-serviceproviderbase](https://github.com/stevenvelozo/fable-serviceproviderbase) - Underlying service provider base
- [fable](https://github.com/stevenvelozo/fable) - Service provider framework
