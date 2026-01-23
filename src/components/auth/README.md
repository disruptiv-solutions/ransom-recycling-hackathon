# Authentication Components

This directory contains authentication-related UI components.

## Components

### LogoutButton (`logout-button.tsx`)

A button component that handles user logout functionality.

---

### RoleSwitcher (`role-switcher.tsx`)

A dropdown menu component that allows superadmins to quickly switch between different role views for testing and administration purposes.

**Features:**
- Only visible to users with `admin` role (superadmins)
- Dropdown menu with all available role views
- Visual indicators showing current role
- Color-coded icons for each role
- Smooth transitions and animations
- Click-outside to close functionality

**Available Role Views:**
1. **Participant View** (UserCircle icon, Accent color)
   - Routes to `/participant`
   - See the app from a participant's perspective

2. **Supervisor View** (Briefcase icon, Primary color)
   - Routes to `/staff`
   - Staff overview dashboard

3. **Case Manager View** (Users icon, Teal color)
   - Routes to `/staff`
   - Staff overview dashboard

4. **Admin View** (ShieldCheck icon, Amber color)
   - Routes to `/staff/admin`
   - Full admin controls

**Props:**
```typescript
interface RoleSwitcherProps {
  currentRole: string;      // Current role being viewed
  isSuperAdmin: boolean;    // Whether user is a superadmin
}
```

**Usage:**
```tsx
<RoleSwitcher 
  currentRole={profile.role} 
  isSuperAdmin={profile.role === "admin"} 
/>
```

**Implementation Notes:**
- Uses client-side navigation (`useRouter`)
- Automatically hides if user is not a superadmin
- Current role is disabled in the dropdown
- Includes visual checkmark for current role
- Responsive design (hides label text on mobile)

**Security:**
- Component visibility is controlled by `isSuperAdmin` prop
- Server-side route protection should still be in place
- This is a UI convenience tool, not a security mechanism

**Styling:**
- Follows the app's design system
- Uses Tailwind CSS for all styling
- Includes hover and focus states
- Smooth dropdown animations
- Backdrop overlay for better UX

---

## Integration

Both components are integrated into the app layouts:

### Participant Layout
Located in header, next to logout button:
```tsx
<RoleSwitcher currentRole="participant" isSuperAdmin={isSuperAdmin} />
<LogoutButton />
```

### Staff Layout
Located in:
1. **Desktop sidebar** (bottom section, above logout)
2. **Mobile header** (top right, next to logout)

---

## Future Enhancements

- Add keyboard shortcuts (e.g., Ctrl+Shift+R to open)
- Add "Recently Viewed" roles for quick switching
- Add tooltips explaining each role
- Add animation when switching roles
- Store last viewed role in localStorage
- Add breadcrumb showing role hierarchy
