# API Reference

## Inheritance Chain

```
YourService
    └── PictServiceProviderBase        (this module)
            └── FableServiceProviderBase    (fable-serviceproviderbase)
```

Everything below is available to any class that extends `PictServiceProviderBase`.
Properties marked **(Fable)** are inherited from `FableServiceProviderBase`;
properties marked **(Pict)** are added by this module.

## Constructor

```javascript
constructor(pFable, pOptions, pServiceHash)
```

The constructor supports two calling conventions:

**With a Fable/Pict instance** (standard):
```javascript
new MyService(pictInstance, { timeout: 5000 }, 'my-hash')
```
Calls `connectFable(pictInstance)` automatically. `UUID` comes from
`pictInstance.getUUID()`.

**Without a Fable/Pict instance** (core pre-initialization):
```javascript
new MyService({ timeout: 5000 }, 'my-hash')
```
The first argument is treated as options. `UUID` is generated as
`CORE-SVC-<random>`. `fable` is set to `false`; `pict`, `log`, `services`
are not available until `connectFable()` is called later.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pFable` | object | No | A Fable or Pict instance. If omitted or not a Fable object, treated as options. |
| `pOptions` | object | No | Configuration options for this service instance |
| `pServiceHash` | string | No | Instance key in the service map. Defaults to UUID. |

## Properties

### From FableServiceProviderBase (Fable)

| Property | Type | Set When | Description |
|----------|------|----------|-------------|
| `fable` | object\|false | Construction or `connectFable()` | The Fable/Pict instance. `false` before connection. |
| `UUID` | string | Construction | Unique identifier. From `fable.getUUID()` or `CORE-SVC-<random>`. |
| `Hash` | string | Construction | Instance key within the services map. Defaults to UUID. Used to distinguish multiple instances of the same service type. |
| `options` | object | Construction | Configuration object passed at construction. |
| `serviceType` | string | Construction | Defaults to `Unknown-<UUID>`. Your subclass should set this. |
| `log` | object | `connectFable()` | Reference to `fable.Logging`. Not available on core services until connected. |
| `services` | object | `connectFable()` | Shared map of default service instances, keyed by `serviceType`. |
| `servicesMap` | object | `connectFable()` | Hierarchical map: `servicesMap[serviceType][hash]`. |
| `_PackageFableServiceProvider` | object | Construction | `{ name, version }` from fable-serviceproviderbase's package.json. |

### From PictServiceProviderBase (Pict)

| Property | Type | Set When | Description |
|----------|------|----------|-------------|
| `pict` | object | `connectFable()` | Reference to the Pict instance. Same object as `this.fable`. |
| `_PackagePictServiceProvider` | object | Construction | `{ name, version }` from this module's package.json. |

### Static

| Property | Value | Source | Description |
|----------|-------|--------|-------------|
| `isFableService` | `true` | FableServiceProviderBase | Identifies the class as a valid Fable service constructor. |

## Methods

### connectFable(pFable)

Connects the service to a Fable/Pict instance. Called automatically by the
constructor when a valid Fable object is passed, or called manually for
core pre-initialization services.

```javascript
connectFable(pFable)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `pFable` | object | A Fable or Pict instance (must have `isFable === true`) |

**Returns:** `true` on success.

**Behavior (inherited from FableServiceProviderBase):**
- Validates `pFable.isFable`. Returns an `Error` if invalid.
- Sets `this.fable` (only if not already set).
- Sets `this.log` to `pFable.Logging` (only if not already set).
- Sets `this.services` to `pFable.services` (only if not already set).
- Sets `this.servicesMap` to `pFable.servicesMap` (only if not already set).

**Additional behavior (this module):**
- Sets `this.pict` to `pFable` (only if not already set).

All assignments are guarded -- calling `connectFable()` a second time will
not overwrite existing references.

## Exports

```javascript
const libPictServiceProviderBase = require('pict-serviceproviderbase');

// Default export -- the class itself
libPictServiceProviderBase            // PictServiceProviderBase

// Named export -- same class, semantic alias for core service pattern
libPictServiceProviderBase.CoreServiceProviderBase  // PictServiceProviderBase
```

Both exports reference the same class. `CoreServiceProviderBase` exists as a
semantic marker for services intended to be instantiated before Pict is
initialized.
