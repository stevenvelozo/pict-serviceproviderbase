# Pict Service Provider Base

Base class for creating services that integrate with the Pict application
framework. Extends `fable-serviceproviderbase` to add a `this.pict` reference,
bridging the generic Fable service infrastructure into the Pict ecosystem.

## How It Relates to Fable

Retold's service architecture has two layers:

```
Your Service
    └── PictServiceProviderBase (this module)
            └── FableServiceProviderBase (fable-serviceproviderbase)
```

[fable-serviceproviderbase](https://github.com/stevenvelozo/fable-serviceproviderbase)
provides the foundation: dependency injection via a Fable instance, service
registration, UUID/Hash identity, logging and access to other services through
the shared `services` map. It knows nothing about Pict.

This module adds one thing: when `connectFable()` is called, it also sets
`this.pict` as a reference to the passed-in Fable/Pict instance. Because Pict
itself extends Fable, `this.pict` and `this.fable` point to the same object.
The alias exists so that service code can read naturally when working in a
Pict application context.

### What You Get from the Fable Layer

Every service that extends this class inherits these properties and behaviors
from `fable-serviceproviderbase`:

| Property | Description |
|----------|-------------|
| `this.fable` | The Fable/Pict instance (set on construction or via `connectFable`) |
| `this.UUID` | Unique identifier, from `fable.getUUID()` or auto-generated for core services |
| `this.Hash` | Instance key within the service map (defaults to UUID) |
| `this.options` | Configuration object passed at construction |
| `this.log` | Shortcut to `fable.Logging` |
| `this.services` | Shared map of all registered default service instances |
| `this.servicesMap` | Hierarchical map organized by service type then hash |
| `this.serviceType` | Identifier string (set by your subclass) |

### What This Module Adds

| Property | Description |
|----------|-------------|
| `this.pict` | Reference to the Pict instance (alias for `this.fable`) |

The `connectFable()` override calls `super.connectFable()` first (which sets
up `fable`, `log`, `services`, `servicesMap`), then assigns `this.pict` if it
has not already been set.

## Basic Services

There are two instantiation patterns. The standard pattern takes a fully
initialized Pict object:

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
        // this.pict and this.fable are the same object
        this.pict.log.info(`SimpleService ${this.UUID}::${this.Hash} is doing something.`);
    }
}
```

Register and instantiate through Pict's service manager:

```javascript
const libPict = require('pict');

// Register the service class
libPict.addServiceType('SimpleService', SimpleService);

// Create Pict instance and instantiate the service
const _Pict = new libPict({ /* settings */ });
const myService = _Pict.instantiateServiceProvider('SimpleService',
    { /* options */ }, 'my-instance');

myService.doSomething();
```

## Core Pre-initialization Services

For services that must exist before Pict is fully initialized, create
the service without a Fable instance and connect it later:

```javascript
const libPictServiceProviderBase = require('pict-serviceproviderbase');

// Use the CoreServiceProviderBase export (same class, semantic alias)
class EarlyService extends libPictServiceProviderBase.CoreServiceProviderBase
{
    constructor(pOptions, pServiceHash)
    {
        super(pOptions, pServiceHash);
        this.serviceType = 'EarlyService';
    }
}

// Create before Pict exists
const earlyService = new EarlyService({ bufferSize: 100 }, 'EarlyService-1');
// earlyService.fable === false at this point
// earlyService.pict === undefined

// Later, after Pict is initialized:
const _Pict = new libPict({ /* settings */ });
_Pict.serviceManager.connectPreinitServiceProviderInstance(earlyService);
// earlyService.fable and earlyService.pict now reference _Pict
```

The caveat is that `log`, `services`, and `pict` are not available until
`connectFable()` has been called. Code that runs before connection should
not depend on those properties.

## Pict Services Available to Your Service

Once connected, your service can access everything Pict provides:

```javascript
// Logging
this.pict.log.info('Message');
this.pict.log.error('Problem');

// Application settings
const val = this.pict.settings.SomeConfigKey;

// UUID generation
const id = this.pict.getUUID();

// Shared application state
this.pict.AppData.myValue = 42;

// Other registered services
this.services.SomeOtherService.doWork();

// Templating
const html = this.pict.parseTemplate('Hello {~Data:Name~}', { Name: 'World' });
```

## Multiple Instances

The service manager supports multiple instances of the same service type,
distinguished by their Hash:

```javascript
_Pict.serviceManager.instantiateServiceProvider('DatabaseService',
    { host: 'primary.db' }, 'PrimaryDB');
_Pict.serviceManager.instantiateServiceProvider('DatabaseService',
    { host: 'replica.db' }, 'ReplicaDB');

// Access by hash
_Pict.serviceManager.servicesMap.DatabaseService.PrimaryDB;
_Pict.serviceManager.servicesMap.DatabaseService.ReplicaDB;

// Switch which instance is the default
_Pict.serviceManager.setDefaultServiceInstantiation('DatabaseService', 'ReplicaDB');
// Now _Pict.serviceManager.services.DatabaseService points to ReplicaDB
```

## Related Packages

- [fable-serviceproviderbase](https://github.com/stevenvelozo/fable-serviceproviderbase) -- The generic service base class this module extends
- [fable](https://github.com/stevenvelozo/fable) -- Core dependency injection and service management
- [pict](https://github.com/stevenvelozo/pict) -- Application framework built on Fable
- [pict-view](https://github.com/stevenvelozo/pict-view) -- View base class (extends this module)
- [pict-provider](https://github.com/stevenvelozo/pict-provider) -- Provider base class with lifecycle hooks
