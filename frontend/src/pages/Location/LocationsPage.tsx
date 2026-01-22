import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Edit2, Trash2, Filter, X } from "lucide-react";

import { locationService } from "../../services/locationService";
import type { Location } from "../../types/location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";




const LocationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<Location[]>([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    featured: "",
    active: "",
  });

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (filters.featured !== "") params.featured = filters.featured === "true";
      if (filters.active !== "") params.active = filters.active === "true";

      const response = await locationService.getAll(params);
      setLocations(response.data);
    } catch {
      setError("Failed to fetch locations");
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleSearch = () => {
    setSearch(searchInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await locationService.delete(id);
      fetchLocations();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete location");
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      featured: "",
      active: "",
    });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="p-4 md:p-6 text-white bg-background min-h-screen w-full">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">Locations</h1>
            <p className="text-gray-400 text-sm mt-1">{locations.length} total locations</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:w-auto w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                  {Object.values(filters).filter((v) => v !== "").length}
                </span>
              )}
            </Button>
            <Button onClick={() => navigate("/locations/create")} className="sm:w-auto w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex gap-2 flex-1">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search locations..."
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

        {showFilters && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Filters</h3>
              <div className="flex gap-2">
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Featured</label>
                <select
                  value={filters.featured}
                  onChange={(e) => handleFilterChange("featured", e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none text-white"
                >
                  <option value="">All</option>
                  <option value="true">Featured</option>
                  <option value="false">Not Featured</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Active</label>
                <select
                  value={filters.active}
                  onChange={(e) => handleFilterChange("active", e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none text-white"
                >
                  <option value="">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        )}
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
        ) : locations.length === 0 ? (
          <div className="p-6 text-center text-gray-400">No locations found</div>
        ) : (
          locations.map((location) => (
            <div
              key={location._id}
              className="bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{location.name}</h3>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">{location.description}</p>
                </div>
                <div className="flex flex-col gap-2 ml-2">
                  {location.featured && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 shrink-0">
                      Featured
                    </span>
                  )}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${location.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                  >
                    {location.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 pt-3 border-t border-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-blue-400 hover:text-blue-300"
                  onClick={() => navigate(`/locations/${location._id}/edit`)}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-red-400 hover:text-red-300"
                  onClick={() => handleDelete(location._id!, location.name)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
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
              <th className="p-3">Properties</th>
              <th className="p-3">Featured</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : locations.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  No locations found
                </td>
              </tr>
            ) : (
              locations.map((location) => (
                <tr
                  key={location._id}
                  className="border-t border-gray-700 hover:bg-gray-800"
                >
                  <td className="p-3 font-medium">{location.name}</td>
                  <td className="p-3">{location.propertyCount || 0}</td>

                  <td className="p-3">
                    {location.featured ? (
                      <span className="text-yellow-400">★</span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${location.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                    >
                      {location.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-400 hover:text-blue-300"
                        onClick={() => navigate(`/locations/${location._id}/edit`)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => handleDelete(location._id!, location.name)}
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
    </div>
  );
};

export default LocationsPage;
