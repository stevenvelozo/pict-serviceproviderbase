# API Reference

Complete API documentation for Pict-ServiceProviderBase.

## Class: PictServiceProviderBase

The main class to extend when creating Pict services.

### Constructor

```javascript
constructor(pPict, pOptions, pServiceHash)
```

Creates a new service instance.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pPict` | object | Yes | The Pict/Fable instance |
| `pOptions` | object | No | Configuration options |
| `pServiceHash` | string | No | Unique identifier for this instance |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `pict` | object | Reference to the Pict instance |
| `fable` | object | Reference to the Fable instance (same as pict) |
| `options` | object | Configuration options passed to constructor |
| `UUID` | string | Auto-generated unique identifier |
| `Hash` | string | Service hash (from constructor or auto-generated) |
| `serviceType` | string | Type identifier (set in subclass) |
| `log` | object | Logger instance |

### Methods

#### connectFable(pFable)

Connects or reconnects the service to a Fable/Pict instance.

```javascript
connectFable(pFable)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `pFable` | object | The Fable/Pict instance to connect |

**Returns:** `boolean` - Always returns `true`

This method is primarily used for core pre-initialization services that need to defer their Pict connection.

## Usage Examples

### Basic Service

```javascript
const libPictServiceProviderBase = require('pict-serviceproviderbase');

class DataService extends libPictServiceProviderBase
{
    constructor(pPict, pOptions, pServiceHash)
    {
        super(pPict, pOptions, pServiceHash);
        this.serviceType = 'DataService';
        this._data = {};
    }

    setData(key, value)
    {
        this._data[key] = value;
        this.pict.log.debug(`DataService: Set ${key}`);
    }

    getData(key)
    {
        return this._data[key];
    }
}

module.exports = DataService;
```

### Service with Options

```javascript
class ConfigurableService extends libPictServiceProviderBase
{
    constructor(pPict, pOptions, pServiceHash)
    {
        super(pPict, pOptions, pServiceHash);
        this.serviceType = 'ConfigurableService';

        // Use options with defaults
        this.timeout = this.options.timeout || 5000;
        this.retries = this.options.retries || 3;
    }
}

// Instantiate with options
const service = _Pict.instantiateServiceProvider('ConfigurableService', {
    timeout: 10000,
    retries: 5
}, 'my-config-service');
```

### Service with Async Operations

```javascript
class AsyncService extends libPictServiceProviderBase
{
    constructor(pPict, pOptions, pServiceHash)
    {
        super(pPict, pOptions, pServiceHash);
        this.serviceType = 'AsyncService';
    }

    async fetchData(url)
    {
        this.pict.log.info(`Fetching: ${url}`);
        try
        {
            const response = await fetch(url);
            return await response.json();
        }
        catch (error)
        {
            this.pict.log.error(`Fetch failed: ${error.message}`);
            throw error;
        }
    }
}
```

## Inheritance Chain

```
PictServiceProviderBase
  └── FableServiceProviderBase (from fable-serviceproviderbase)
```

Your custom services extend this chain, gaining all functionality from both base classes.
