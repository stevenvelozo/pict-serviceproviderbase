# Creating Services

This guide walks through building custom Pict services. Each service you
create extends `PictServiceProviderBase`, which itself extends Fable's
`FableServiceProviderBase`. That inheritance chain gives your service
dependency injection, logging, and access to every other registered service
-- all managed by the Fable/Pict runtime.

## Minimal Service

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

The key points:
- Call `super()` with all three parameters so Fable can wire up the service.
- Set `this.serviceType` to a descriptive name. Fable uses this as the key in
  the service map.
- Use `this.pict` (or equivalently `this.fable`) to access the runtime.

## Registering and Instantiating

Services must be registered as a type before they can be instantiated through
the service manager:

```javascript
const libPict = require('pict');
const SimpleService = require('./SimpleService');

// 1. Register the class (can be done before creating a Pict instance)
libPict.addServiceType('SimpleService', SimpleService);

// 2. Create the Pict instance
const _Pict = new libPict({ /* settings */ });

// 3. Instantiate through the service manager
const myService = _Pict.instantiateServiceProvider('SimpleService',
    { customOption: 'value' },  // options
    'my-instance');              // hash

myService.doSomething();
```

After step 3, the service is available at:
- `_Pict.serviceManager.services.SimpleService` (default instance)
- `_Pict.serviceManager.servicesMap.SimpleService['my-instance']` (by hash)

## What Your Service Gets from Fable

When `super()` is called with a valid Pict instance, the Fable base class
calls `connectFable()`, which wires up these properties:

| Property | What It Is |
|----------|------------|
| `this.fable` | The Fable/Pict instance |
| `this.pict` | Same object as `this.fable` (added by PictServiceProviderBase) |
| `this.log` | `fable.Logging` -- the shared logger |
| `this.services` | Map of all default service instances, keyed by serviceType |
| `this.servicesMap` | Hierarchical map: `servicesMap[serviceType][hash]` |
| `this.UUID` | Unique ID from `fable.getUUID()` |
| `this.Hash` | Instance key (from constructor arg, or defaults to UUID) |
| `this.options` | The options object passed at construction |

## Accessing Pict Capabilities

Once connected, your service can use everything Pict provides:

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
        // Logging (multiple levels)
        this.pict.log.trace('Detailed trace');
        this.pict.log.info('Information');
        this.pict.log.error('Problem occurred');

        // Application settings (from Pict constructor config)
        const val = this.pict.settings.SomeConfigKey;

        // UUID generation
        const id = this.pict.getUUID();

        // Shared application state
        this.pict.AppData.myValue = 42;

        // Templating
        const html = this.pict.parseTemplate(
            'Hello {~Data:Name~}', { Name: 'World' });

        // Access another registered service
        const formatted = this.services.DataFormat.formatterDollars(1234.56);
    }
}
```

## Using Options for Configuration

Pass configuration at instantiation time through the options object:

```javascript
class CacheService extends libPictServiceProviderBase
{
    constructor(pPict, pOptions, pServiceHash)
    {
        super(pPict, pOptions, pServiceHash);
        this.serviceType = 'CacheService';

        this.maxEntries = this.options.maxEntries || 1000;
        this.ttlMs = this.options.ttlMs || 60000;
        this._cache = {};
    }
}

// Instantiate with specific configuration
_Pict.instantiateServiceProvider('CacheService',
    { maxEntries: 500, ttlMs: 30000 }, 'SessionCache');
```

## Multiple Instances of the Same Service

The Hash parameter lets you create multiple instances of one service type:

```javascript
_Pict.instantiateServiceProvider('DatabaseService',
    { host: 'primary.db' }, 'PrimaryDB');
_Pict.instantiateServiceProvider('DatabaseService',
    { host: 'replica.db' }, 'ReplicaDB');

// Access by hash
const primary = _Pict.serviceManager.servicesMap.DatabaseService.PrimaryDB;
const replica = _Pict.serviceManager.servicesMap.DatabaseService.ReplicaDB;

// The first instance is the default
_Pict.serviceManager.services.DatabaseService === primary; // true

// Switch the default
_Pict.serviceManager.setDefaultServiceInstantiation('DatabaseService', 'ReplicaDB');
_Pict.serviceManager.services.DatabaseService === replica; // true
```

## Core Pre-initialization Services

Sometimes a service must exist before Pict is initialized. For example, a
configuration loader that provides settings to the Pict constructor.

These services are created without a Fable instance and connected later:

```javascript
class ConfigLoader extends libPictServiceProviderBase.CoreServiceProviderBase
{
    constructor(pOptions, pServiceHash)
    {
        // No Fable instance -- options is the first argument
        super(pOptions, pServiceHash);
        this.serviceType = 'ConfigLoader';
    }

    loadConfig()
    {
        // Can work without Pict -- just no logging or service access yet
        return { loaded: true };
    }

    connectFable(pFable)
    {
        super.connectFable(pFable);
        // Now this.pict, this.log, this.services are available
        this.pict.log.info('ConfigLoader connected to Pict');
        return true;
    }
}

// 1. Create the service early
const configLoader = new ConfigLoader({ path: '/etc/app.json' }, 'ConfigLoader-1');
// configLoader.fable === false
// configLoader.pict === undefined

// 2. Initialize Pict later
const _Pict = new libPict(configLoader.loadConfig());

// 3. Connect the pre-init service
_Pict.serviceManager.connectPreinitServiceProviderInstance(configLoader);
// configLoader.pict now references _Pict
```

**Important:** Before `connectFable()` is called, `this.log`, `this.services`,
and `this.pict` are not available. Guard any code that runs before connection.

## Best Practices

1. **Always set `serviceType`** -- Fable uses this as the key in the service
   map, and it appears in log output for debugging.
2. **Use `this.pict.log`** -- Consistent, configurable logging across the
   application instead of `console.log`.
3. **Store configuration in `options`** -- Keep service-specific settings in
   the options object rather than global state.
4. **Use meaningful Hash values** -- `'PrimaryDB'` is more useful than a
   random UUID when debugging service maps.
5. **Follow existing module patterns** -- Look at how modules like
   `pict-section-form` or `orator` structure their services for real-world
   examples within the Retold ecosystem.
