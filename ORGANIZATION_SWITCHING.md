# Organization Switching in DTR System

This document explains how organization switching works in the DTR (Daily Time Record) system and how to use it effectively.

## Overview

The DTR system now supports seamless switching between multiple organizations. Users can:
- Belong to multiple organizations
- Switch between organizations without losing their session
- Have different roles (admin/member) in different organizations
- Access organization-specific data and features

## How It Works

### 1. Organization Context Provider

The `OrganizationProvider` wraps the entire application and provides:
- Current organization state
- List of all user organizations
- Organization switching functions
- Persistent organization selection
- Organization switching state management

### 2. Persistent Storage

Organization selection is persisted using:
- **localStorage**: For client-side persistence across browser sessions
- **Cookies**: For server-side access when needed

### 3. Automatic Data Refresh

When switching organizations:
- The page automatically refreshes to ensure all server-side data is updated
- All organization-specific data is refreshed with the new organization context
- Components using the organization context will re-render
- API calls will use the new organization ID

### 4. Switching State Management

During organization switching:
- UI shows "Switching..." text and loading spinners
- All organization-related buttons are disabled
- Page refreshes automatically after organization change
- Smooth user experience with clear visual feedback

## Components

### Organization Selector (Sidebar)

Located in the sidebar, this component provides:
- Dropdown to switch between organizations
- Create new organization functionality
- Role indicators for each organization
- Loading states during organization switching

### Organization Switcher

A reusable component available in two variants:
- **Default**: Full-width button with organization details
- **Compact**: Small button for headers and tight spaces
- **Loading States**: Shows "Switching..." text and spinner during organization changes

## Usage Examples

### Basic Organization Access

```tsx
import { useOrganizationContext } from '@/lib/contexts/organization-context';

function MyComponent() {
  const { currentOrganization, organizations } = useOrganizationContext();
  
  if (!currentOrganization) {
    return <div>No organization selected</div>;
  }
  
  return (
    <div>
      <h1>Welcome to {currentOrganization.name}</h1>
      <p>Your role: {currentOrganization.role}</p>
    </div>
  );
}
```

### Organization Switching

```tsx
import { useOrganizationContext } from '@/lib/contexts/organization-context';

function OrganizationSwitcher() {
  const { switchOrganization, organizations } = useOrganizationContext();
  
  return (
    <select onChange={(e) => switchOrganization(e.target.value)}>
      {organizations.map(org => (
        <option key={org.id} value={org.id}>
          {org.name} ({org.role})
        </option>
      ))}
    </select>
  );
}
```

### Reacting to Organization Changes

```tsx
import { useOrganizationEffect } from '@/lib/hooks/use-organization-effect';

function DataComponent() {
  const [data, setData] = useState(null);
  
  useOrganizationEffect(async () => {
    // This will run whenever the organization changes
    const newData = await fetchOrganizationData();
    setData(newData);
  });
  
  return <div>{/* render data */}</div>;
}
```

### Getting Current Organization ID

```tsx
import { useCurrentOrganizationId } from '@/lib/hooks/use-current-organization';

function ApiComponent() {
  const orgId = useCurrentOrganizationId();
  
  useEffect(() => {
    if (orgId) {
      fetchData(orgId);
    }
  }, [orgId]);
  
  return <div>{/* component content */}</div>;
}
```

## API Integration

### Server-Side Organization Access

For server-side components and API routes, use the `auth()` function:

```tsx
import { auth } from '@/lib/auth';

export default async function ServerComponent() {
  const { userId, orgId } = await auth();
  
  if (!orgId) {
    redirect('/welcome');
  }
  
  // Fetch organization-specific data
  const data = await fetchData(orgId);
  
  return <div>{/* render data */}</div>;
}
```

### Client-Side API Calls

For client-side API calls, the organization context automatically provides the current organization:

```tsx
import { useCurrentOrganizationId } from '@/lib/hooks/use-current-organization';

function ClientComponent() {
  const orgId = useCurrentOrganizationId();
  
  const fetchData = async () => {
    const response = await fetch(`/api/data?orgId=${orgId}`);
    // ... handle response
  };
  
  return <button onClick={fetchData}>Fetch Data</button>;
}
```

## Organization Management

### Creating Organizations

```tsx
import { useOrganizationContext } from '@/lib/contexts/organization-context';

function CreateOrganization() {
  const { createOrganization } = useOrganizationContext();
  
  const handleCreate = async (name: string, description?: string) => {
    try {
      const newOrg = await createOrganization(name, description);
      console.log('Created organization:', newOrg);
    } catch (error) {
      console.error('Failed to create organization:', error);
    }
  };
  
  return <button onClick={() => handleCreate('New Org')}>Create</button>;
}
```

### Joining Organizations

```tsx
import { useOrganizationContext } from '@/lib/contexts/organization-context';

function JoinOrganization() {
  const { joinOrganization } = useOrganizationContext();
  
  const handleJoin = async (orgId: string) => {
    try {
      await joinOrganization(orgId);
      console.log('Joined organization successfully');
    } catch (error) {
      console.error('Failed to join organization:', error);
    }
  };
  
  return <button onClick={() => handleJoin('org-id')}>Join</button>;
}
```

## Best Practices

### 1. Always Check for Organization

```tsx
// Good
if (!currentOrganization) {
  return <div>Please select an organization</div>;
}

// Bad
return <div>Welcome to {currentOrganization.name}</div>; // Could crash
```

### 2. Use Organization Effect for Data Refresh

```tsx
// Good - automatically refreshes when organization changes
useOrganizationEffect(() => {
  fetchData();
});

// Bad - manual dependency management
useEffect(() => {
  fetchData();
}, [currentOrganization?.id]);
```

### 3. Handle Loading States

```tsx
function MyComponent() {
  const { currentOrganization, loading } = useOrganizationContext();
  
  if (loading) {
    return <div>Loading organizations...</div>;
  }
  
  if (!currentOrganization) {
    return <div>No organization selected</div>;
  }
  
  return <div>{/* component content */}</div>;
}
```

### 4. Provide Fallbacks

```tsx
function OrganizationAwareComponent() {
  const { currentOrganization } = useOrganizationContext();
  
  return (
    <div>
      <h1>{currentOrganization?.name || 'Select Organization'}</h1>
      <p>Role: {currentOrganization?.role || 'Unknown'}</p>
    </div>
  );
}
```

## Troubleshooting

### Common Issues

1. **Organization not persisting**: Check if localStorage is enabled and not blocked
2. **Data not refreshing**: Ensure components use `useOrganizationEffect` or properly depend on `currentOrganization.id`
3. **Permission errors**: Verify user has proper role in the selected organization

### Debug Information

To debug organization-related issues:

```tsx
import { useOrganizationContext } from '@/lib/contexts/organization-context';

function DebugComponent() {
  const context = useOrganizationContext();
  
  console.log('Organization Context:', context);
  
  return (
    <div>
      <pre>{JSON.stringify(context, null, 2)}</pre>
    </div>
  );
}
```

## Migration from Old System

If you're migrating from the old `useOrganization` hook:

1. Replace `useOrganization()` with `useOrganizationContext()`
2. Update property names:
   - `organization` → `currentOrganization`
   - Add `organizations` array access
3. Use `useOrganizationEffect` for automatic data refresh
4. Remove manual cookie management (now handled automatically)

## Future Enhancements

- Organization-specific themes and branding
- Cross-organization data sharing
- Advanced permission management
- Organization templates and cloning
- Bulk organization operations
