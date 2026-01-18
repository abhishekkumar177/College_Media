import React, { useState, useEffect } from 'react';
import { usePermission } from '../../hooks/usePermission';
import PermissionGate from '../../components/auth/PermissionGate';
import './RoleManager.css';

interface Permission {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  resource: string;
  action: string;
  scope: string;
  category: string;
}

interface Role {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  level: number;
  permissions: Permission[];
  isSystemRole: boolean;
  color: string;
  icon: string;
  userCount: number;
}

const RoleManager: React.FC = () => {
  const { hasPermission } = usePermission();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Record<string, Permission[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    level: 10,
    permissions: [] as string[],
    color: '#667eea',
    icon: '👤'
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/roles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }

      const data = await response.json();
      setRoles(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/roles/permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }

      const data = await response.json();
      setPermissions(data.data.grouped || {});
    } catch (err) {
      console.error('Error fetching permissions:', err);
    }
  };

  const handleCreateRole = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create role');
      }

      await fetchRoles();
      setIsCreating(false);
      resetForm();
      alert('Role created successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error creating role');
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/roles/${selectedRole._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update role');
      }

      await fetchRoles();
      setIsEditing(false);
      setSelectedRole(null);
      resetForm();
      alert('Role updated successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error updating role');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete role');
      }

      await fetchRoles();
      alert('Role deleted successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting role');
    }
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      level: role.level,
      permissions: role.permissions.map(p => p._id),
      color: role.color,
      icon: role.icon
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      description: '',
      level: 10,
      permissions: [],
      color: '#667eea',
      icon: '👤'
    });
    setSelectedRole(null);
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  if (!hasPermission('role:manage')) {
    return (
      <div className="role-manager-access-denied">
        <h1>Access Denied</h1>
        <p>You don't have permission to manage roles.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="role-manager-loading">
        <div className="spinner"></div>
        <p>Loading roles...</p>
      </div>
    );
  }

  return (
    <PermissionGate permission="role:manage">
      <div className="role-manager">
        <div className="role-manager-header">
          <h1>🛡️ Role & Permission Management</h1>
          <p className="subtitle">Manage user roles and their associated permissions</p>
          <button
            className="btn-primary"
            onClick={() => {
              setIsCreating(true);
              setIsEditing(false);
              resetForm();
            }}
          >
            ➕ Create New Role
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            ❌ {error}
          </div>
        )}

        {(isCreating || isEditing) && (
          <div className="role-form-modal">
            <div className="role-form">
              <h2>{isCreating ? 'Create New Role' : `Edit Role: ${selectedRole?.displayName}`}</h2>

              <div className="form-group">
                <label>Role Name (Unique ID)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., moderator"
                  disabled={isEditing && selectedRole?.isSystemRole}
                />
              </div>

              <div className="form-group">
                <label>Display Name</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g., Content Moderator"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this role can do..."
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Level (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                    disabled={isEditing && selectedRole?.isSystemRole}
                  />
                  <small>Higher levels can manage lower levels</small>
                </div>

                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Icon</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="form-group permissions-section">
                <label>Permissions</label>
                <div className="permissions-grid">
                  {Object.entries(permissions).map(([category, perms]) => (
                    <div key={category} className="permission-category">
                      <h4>{category.replace(/_/g, ' ').toUpperCase()}</h4>
                      {perms.map((perm) => (
                        <label key={perm._id} className="permission-checkbox">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(perm._id)}
                            onChange={() => handlePermissionToggle(perm._id)}
                          />
                          <span className="permission-info">
                            <strong>{perm.displayName}</strong>
                            <small>{perm.description}</small>
                            <code>{perm.name}</code>
                          </span>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button
                  className="btn-primary"
                  onClick={isCreating ? handleCreateRole : handleUpdateRole}
                >
                  {isCreating ? 'Create Role' : 'Update Role'}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="roles-grid">
          {roles.map((role) => (
            <div
              key={role._id}
              className="role-card"
              style={{ borderLeftColor: role.color }}
            >
              <div className="role-card-header">
                <div className="role-icon" style={{ backgroundColor: role.color }}>
                  {role.icon}
                </div>
                <div className="role-info">
                  <h3>{role.displayName}</h3>
                  <p className="role-name">@{role.name}</p>
                </div>
                {role.isSystemRole && (
                  <span className="system-badge">🔒 System</span>
                )}
              </div>

              <p className="role-description">{role.description}</p>

              <div className="role-stats">
                <div className="stat">
                  <span className="stat-label">Level</span>
                  <span className="stat-value">{role.level}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Permissions</span>
                  <span className="stat-value">{role.permissions.length}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Users</span>
                  <span className="stat-value">{role.userCount}</span>
                </div>
              </div>

              <div className="role-actions">
                <button
                  className="btn-edit"
                  onClick={() => handleEditRole(role)}
                >
                  ✏️ Edit
                </button>
                {!role.isSystemRole && (
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteRole(role._id)}
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PermissionGate>
  );
};

export default RoleManager;
