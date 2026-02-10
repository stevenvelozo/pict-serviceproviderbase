# Pict-ServiceProviderBase

> The Pict-specific service base class, bridging Fable's dependency injection into the Pict application framework.

## What This Module Does

This module provides a single class that extends
[fable-serviceproviderbase](https://github.com/stevenvelozo/fable-serviceproviderbase).
The only thing it adds is a `this.pict` property -- an alias for `this.fable` --
set during `connectFable()`. Everything else (service registration, UUID/Hash
identity, logging, service discovery) comes from the Fable layer.

The purpose is to let Pict service code reference `this.pict` instead of
`this.fable`, which reads more naturally when building Pict applications.

## The Fable Foundation

Fable is Retold's core dependency injection container. It manages services,
configuration, logging, and UUID generation. When you write a service that
extends `fable-serviceproviderbase`, your service can be registered with any
Fable instance and gains access to all other registered services.

Pict extends Fable, adding application lifecycle management, views, providers,
templating, and browser-side rendering. Since Pict *is* a Fable instance,
`this.pict` and `this.fable` always point to the same object.

```
Your Custom Service
    └── PictServiceProviderBase      (adds this.pict)
            └── FableServiceProviderBase  (provides fable, log, services, UUID, Hash, options)
```

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

Register with Pict and use:

```javascript
const libPict = require('pict');

libPict.addServiceType('MyService', MyService);

const _Pict = new libPict();
const myService = _Pict.instantiateServiceProvider('MyService',
    { someOption: true }, 'my-instance');

myService.doSomething();
```

## Installation

```bash
npm install pict-serviceproviderbase
```

## Documentation

- [Fable Relationship](fable-relationship.md) - How the Fable and Pict service layers connect
- [Creating Services](creating-services.md) - Guide to building custom services
- [API Reference](api-reference.md) - Properties, methods, and inheritance chain

## Related Packages

- [fable-serviceproviderbase](https://github.com/stevenvelozo/fable-serviceproviderbase) -- The generic base class this extends
- [fable](https://github.com/stevenvelozo/fable) -- Dependency injection container and service manager
- [pict](https://github.com/stevenvelozo/pict) -- Application framework (extends Fable)
- [pict-view](https://github.com/stevenvelozo/pict-view) -- View base class for UI rendering
- [pict-provider](https://github.com/stevenvelozo/pict-provider) -- Provider base class with data lifecycle hooks
