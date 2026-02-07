import React, { useEffect, useState, useCallback } from "react";
import { Search, Plus, Trash2, ChevronLeft, ChevronRight, Edit2, Eye, EyeOff } from "lucide-react";
import { userService, type User } from "../services/userService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Role options for dropdowns
const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "sales_agent", label: "Sales Agent" },
  { value: "onboarding_agent", label: "Onboarding Agent" },
  { value: "sales_manager", label: "Sales Manager" },
  { value: "business_head", label: "Business Head" },
];

const PAGE_SIZE = 10;

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);


  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "sales_agent" as "admin" | "sales_agent" | "onboarding_agent" | "sales_manager" | "business_head" | "developer",
    managedBy: "",
    autoAssign: false,
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [managers, setManagers] = useState<User[]>([]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "sales_agent" as "admin" | "sales_agent" | "onboarding_agent" | "sales_manager" | "business_head" | "developer",
    managedBy: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getUsers(page, PAGE_SIZE, search);
      setUsers(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Fetch managers based on role
  const fetchManagers = async (role: string) => {
    try {
      let managerRole = "";
      if (role === "sales_agent") {
        managerRole = "sales_manager";
      } else if (role === "onboarding_agent") {
        managerRole = "business_head";
      }

      if (managerRole) {
        // Fetch all users and filter by role on client side
        const response = await userService.getUsers(1, 100, "");
        const filteredManagers = response.data.filter(u => u.role === managerRole);
        setManagers(filteredManagers);
      } else {
        setManagers([]);
      }
    } catch (err) {
      console.error("Failed to fetch managers", err);
      setManagers([]);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setError(null);
    try {
      await userService.createUser(createForm);
      setShowCreateModal(false);
      setCreateForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "sales_agent",
        managedBy: "",
        autoAssign: false,
      });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await userService.deleteUser(id);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      managedBy: user.managedBy?._id || "",
    });
    // Fetch managers if needed for the current user's role
    if (user.role === "sales_agent" || user.role === "onboarding_agent") {
      fetchManagers(user.role);
    }
    setShowEditModal(true);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditLoading(true);
    setError(null);
    try {
      await userService.updateUser(editingUser._id, editForm);
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update user");
    } finally {
      setEditLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400";
      case "sales_agent":
        return "bg-blue-500/20 text-blue-400";
      case "developer":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="p-4 md:p-6 text-white bg-background min-h-screen w-full">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">Users</h1>
            <p className="text-gray-400 text-sm mt-1">{total} total users</p>
          </div>

          <Button onClick={() => setShowCreateModal(true)} className="sm:w-auto w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex gap-2 flex-1">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9 bg-gray-800 border-gray-700 text-white w-full"
              />
            </div>
            <Button onClick={handleSearch} variant="secondary" size="icon" className="shrink-0">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-400">
          {error}
        </div>
      )}

      {/* Mobile card view */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="p-6 text-center text-gray-400">Loading...</div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-gray-400">No users found</div>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className="bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{user.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{user.email}</p>
                  <p className="text-sm text-gray-500 mt-1">{user.phone || "No phone"}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ml-2 shrink-0 ${getRoleBadgeColor(user.role)}`}
                >
                  {user.role.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">
                  <span className="text-gray-500">Assigned leads:</span>
                  <span className="text-gray-300 ml-1 font-medium">
                    {user.role === "sales_agent" ? user.assignedLeadsCount || 0 : "-"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-400 hover:text-blue-300 p-2"
                    onClick={() => openEditModal(user)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 p-2"
                    onClick={() => handleDeleteUser(user._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block overflow-x-auto rounded border border-gray-700">
        <table className="w-full text-left">
          <thead className="bg-gray-900 text-gray-300">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Role</th>
              <th className="p-3">Assigned Leads</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user._id}
                  className="border-t border-gray-700 hover:bg-gray-800"
                >
                  <td className="p-3 font-medium">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.phone || "-"}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${getRoleBadgeColor(user.role)}`}
                    >
                      {user.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-3">
                    {user.role === "sales_agent" ? user.assignedLeadsCount : "-"}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-400 hover:text-blue-300"
                        onClick={() => openEditModal(user)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center md:justify-end items-center gap-3 mt-4">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex-1 sm:flex-none"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Prev</span>
            </Button>
            <span className="text-sm text-gray-400 px-2">
              {page} / {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex-1 sm:flex-none"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Create User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name *</label>
                <Input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email *</label>
                <Input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Password *</label>
                <div className="relative">


                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, password: e.target.value })
                    }
                    className="bg-gray-800 border-gray-700"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone</label>
                <Input
                  type="text"
                  value={createForm.phone}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, phone: e.target.value })
                  }
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Role *</label>
                <select
                  value={createForm.role}
                  onChange={(e) => {
                    const newRole = e.target.value as typeof createForm.role;
                    setCreateForm({
                      ...createForm,
                      role: newRole,
                      managedBy: "",
                      autoAssign: false, // Reset auto-assign on role change
                    });
                    fetchManagers(newRole);
                  }}
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none text-white"
                >
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {(createForm.role === "sales_agent" || createForm.role === "onboarding_agent") && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-400">
                      {createForm.role === "sales_agent"
                        ? "Sales Manager"
                        : "Business Head"}
                    </label>
                    <Button
                      type="button"
                      variant={createForm.autoAssign ? "default" : "secondary"}
                      size="sm"
                      onClick={() =>
                        setCreateForm({
                          ...createForm,
                          autoAssign: !createForm.autoAssign,
                          managedBy: "",
                        })
                      }
                      className="h-7 text-xs"
                    >
                      {createForm.autoAssign ? "Auto-Assign On" : "Auto-Assign Off"}
                    </Button>
                  </div>

                  {!createForm.autoAssign && (
                    <select
                      required
                      value={createForm.managedBy}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, managedBy: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none text-white"
                    >
                      <option value="">Select Manager</option>
                      {managers.map((manager) => (
                        <option key={manager._id} value={manager._id}>
                          {manager.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {createForm.autoAssign && (
                    <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400 italic">
                      System will automatically assign the manager with the lowest workload.
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createLoading} className="w-full sm:w-auto order-1 sm:order-2">
                  {createLoading ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Edit User</h2>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name *</label>
                <Input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email *</label>
                <Input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone</label>
                <Input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Role *</label>
                <select
                  value={editForm.role}
                  onChange={(e) => {
                    const newRole = e.target.value as typeof editForm.role;
                    setEditForm({
                      ...editForm,
                      role: newRole,
                      managedBy: "", // Reset manager when role changes
                    });
                    fetchManagers(newRole);
                  }}
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none text-white"
                >
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {(editForm.role === "sales_agent" || editForm.role === "onboarding_agent") && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    {editForm.role === "sales_agent"
                      ? "Assign Sales Manager *"
                      : "Assign Business Head *"}
                  </label>
                  <select
                    value={editForm.managedBy || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, managedBy: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none text-white"
                  >
                    <option value="">Select Manager</option>
                    {managers.map((manager) => (
                      <option key={manager._id} value={manager._id}>
                        {manager.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={editLoading} className="w-full sm:w-auto order-1 sm:order-2">
                  {editLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
