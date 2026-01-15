# Pict Service Provider

A very basic set of base classes to provide the interface for Pict services.
This is used for instantiating connections to databases, extending core
services and whatever other services.

Some service types Pict provides out of the box:

* settings
* logging
* uuid
* templating
* providers
* application state
* views


## Basic Services

There are two types of services -- just requiring the class provides a base 
class for most services.  The constructor for this type takes in a fully
initialized pict object.

```
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
```

## Core Pre-initialization Services

For some service types, we want to instantiate behaviors before the pict
class has been initialized.  These use a special service base that defers
the connection of an initialized pict object until after it's created.

The one caveat here is the pict service doesn't provide consistent settings,
log or uuid functionality until they have been initialized and mapped in.

If you want to use this base class, please refer to the pict service 
manager code as well to get a good understanding of how initialization 
differs from the basic services.


```
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
```
