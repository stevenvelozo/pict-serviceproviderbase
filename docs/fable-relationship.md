# The Fable-to-Pict Service Bridge

This document explains how `pict-serviceproviderbase` connects the generic
Fable service infrastructure to the Pict application framework, and why
both layers exist.

## Two Layers, One Pattern

Retold's service architecture is split into two layers:

```
┌─────────────────────────────────────────────┐
│  Pict Application Layer                     │
│  (views, providers, templates, AppData)     │
│                                             │
│  pict-serviceproviderbase adds: this.pict   │
├─────────────────────────────────────────────┤
│  Fable Service Layer                        │
│  (DI, logging, UUID, service map, config)   │
│                                             │
│  fable-serviceproviderbase provides:        │
│  fable, log, services, servicesMap,         │
│  UUID, Hash, options, serviceType           │
└─────────────────────────────────────────────┘
```

**Fable** is a general-purpose dependency injection container. It manages
service registration, configuration, logging, and UUID generation. Any
JavaScript module can use Fable services without knowing anything about
web UIs, views, or rendering.

**Pict** extends Fable, adding application lifecycle management, views,
providers, templates, and browser rendering. Since Pict *is* a Fable
instance (`pict.isFable === true`), every Fable service works inside Pict
unchanged.

`pict-serviceproviderbase` is the thin bridge between them. It extends
`fable-serviceproviderbase` and overrides `connectFable()` to also set
`this.pict`. That's it -- one property assignment.

## Why the Separate Module?

The separation exists so that:

1. **Fable stays generic.** Modules like Meadow database connectors or Orator
   server wrappers can extend `fable-serviceproviderbase` directly and work
   with any Fable instance, not just Pict.

2. **Pict services read naturally.** Service code in a Pict application
   references `this.pict.AppData` or `this.pict.parseTemplate()` instead of
   `this.fable.AppData`. Both work, but `this.pict` makes the intent clear.

3. **Future Pict-specific behaviors** can be added to the Pict service base
   without affecting the Fable layer. The `CoreServiceProviderBase` export
   is one example -- it exists as a semantic marker even though it's
   currently the same class.

## How connectFable Works

When a service is instantiated with a Pict instance, the constructor calls
`connectFable()`. Here's what happens at each layer:

### FableServiceProviderBase.connectFable(pFable)

1. Validates `pFable.isFable` is truthy. Returns an `Error` if not.
2. Sets `this.fable = pFable` (only if `this.fable` is falsy).
3. Sets `this.log = pFable.Logging` (only if `this.log` is falsy).
4. Sets `this.services = pFable.services` (only if not set).
5. Sets `this.servicesMap = pFable.servicesMap` (only if not set).
6. Returns `true`.

### PictServiceProviderBase.connectFable(pFable)

1. Calls `super.connectFable(pFable)` -- the Fable behavior above runs.
2. Sets `this.pict = pFable` (only if `this.pict` is falsy).
3. Returns `true`.

All assignments are guarded so calling `connectFable()` again is safe but
has no effect.

## The Service Manager

Neither base class includes a service manager -- that lives in Fable (and
therefore Pict). The service manager is what ties everything together:

```javascript
// Register a service class (class, not instance)
_Pict.serviceManager.addServiceType('MyService', MyServiceClass);

// Create an instance -- calls constructor then registers it
_Pict.serviceManager.instantiateServiceProvider(
    'MyService',          // serviceType
    { option: 'value' },  // options
    'instance-hash'       // hash
);

// The instance is now accessible:
_Pict.serviceManager.services.MyService              // default instance
_Pict.serviceManager.servicesMap.MyService['instance-hash']  // by hash
```

The service manager also handles pre-initialization services:

```javascript
// Create a service before Pict exists
const earlyService = new MyService({ option: 'value' }, 'early-1');

// Later, connect it
_Pict.serviceManager.connectPreinitServiceProviderInstance(earlyService);
```

This calls `earlyService.connectFable(_Pict)`, wiring up all the properties
the service was missing.

## Fable vs Pict: Which Base to Extend?

| Scenario | Extend |
|----------|--------|
| Service used inside a Pict application (views, providers, UI) | `pict-serviceproviderbase` |
| Service that works with any Fable instance (database connectors, utilities) | `fable-serviceproviderbase` |
| Service used in both contexts | `fable-serviceproviderbase` (the common denominator) |

In practice, most services in the `pict/` module group extend
`fable-serviceproviderbase` directly and access the Pict instance through
`this.fable`. Using `pict-serviceproviderbase` gives the `this.pict` alias
and signals intent that the service is Pict-specific.

## Across the Retold Ecosystem

The service provider pattern is used everywhere in Retold:

- **Meadow** database connectors (MySQL, MSSQL, SQLite) extend
  `fable-serviceproviderbase` to manage connection pools as services.
- **Orator** server wrappers extend it to manage HTTP listeners.
- **Pict** views, providers, and section forms extend either base to
  integrate with the UI lifecycle.
- **Utility** modules like Ultravisor use it for process supervision.

All of these share the same service map, so a Pict view can access a Meadow
database service through `this.services.MeadowConnectionMySQL` -- the DI
container is flat and shared across the entire application.
