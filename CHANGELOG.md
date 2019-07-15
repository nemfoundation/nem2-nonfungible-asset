# Changelog

## 0.3.0

- [Asset](./src/Asset.js) class changed the way the metadata is included.

Before:

```javascript
const asset = Asset.create(
    owner,
    'otherchain',
    '26198278f6e862fd82d26c7388a9ed19ed16282c2a4d562463b8b4336929c5d6',
    [
        ['metadata_key', 'metadata_value'],
    ],
);
```

After
```javascript
const asset = Asset.create(
    owner,
    'otherchain',
    '26198278f6e862fd82d26c7388a9ed19ed16282c2a4d562463b8b4336929c5d6',
    {
        'metadata_key': 'metadata_value',
    },
);
```

- metadata values do' not accept the next characters `[',', '.', ' ']`