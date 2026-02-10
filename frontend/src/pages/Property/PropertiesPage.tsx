import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, ChevronLeft, ChevronRight, Edit2, Trash2, Filter, X } from "lucide-react";
import { propertyService, type Property } from "../../services/propertyService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { onboardingService } from "../../services/onboardingService";
import { useAuthStore } from "../../store/authStore";

const PAGE_SIZE = 10;

// Roles that can create/edit/delete properties
const WRITE_ROLES = ['admin', 'onboarding_agent', 'developer'];

const PropertiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuthStore();
  const canWrite = WRITE_ROLES.includes(user?.role || "");
  const canApprove = ['admin', 'business_head'].includes(user?.role || "");
  const [properties, setProperties] = useState<Property[]>([]);
  // ... (existing state)

  // Add these handlers:
  const handleSubmitForApproval = async (id: string) => {
    try {
      await onboardingService.submitForApproval(id, 'Property');
      await checkAuth(); // Refresh user data to get updated status
      fetchProperties();
    } catch (err: any) {
      alert(err.message || "Failed to submit for approval");
    }
  };

  const handleApprove = async (property: Property) => {
    if (!confirm("Are you sure you want to approve this property?")) return;
    try {
      const agentId = (property as any).assignedAgent;
      if (!agentId) throw new Error("No agent assigned to this property");

      await onboardingService.approveItem(agentId, property._id, 'Property');
      await checkAuth();
      fetchProperties();
    } catch (err: any) {
      alert(err.message || "Failed to approve property");
    }
  };

  const handleReject = async (property: Property) => {
    const reason = prompt("Please enter the reason for rejection:");
    if (reason === null) return;
    if (!reason.trim()) {
      alert("Rejection reason is required");
      return;
    }

    try {
      const agentId = (property as any).assignedAgent;
      if (!agentId) throw new Error("No agent assigned to this property");

      await onboardingService.rejectItem(agentId, property._id, 'Property', reason);
      await checkAuth();
      fetchProperties();
    } catch (err: any) {
      alert(err.message || "Failed to reject property");
    }
  };

  const getOnboardingItem = (propertyId: string) => {
    return user?.assignedProperties?.find(p => p.propertyId === propertyId);
  };
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    propertyType: "",
    status: "",
    featured: "",
    active: "",
    verificationStatus: "",
  });

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page,
        limit: PAGE_SIZE,
      };
      if (search) params.search = search;
      if (filters.propertyType) params.propertyType = filters.propertyType;
      if (filters.status) params.status = filters.status;
      if (filters.featured !== "") params.featured = filters.featured === "true";
      if (filters.active !== "") params.active = filters.active === "true";
      if (filters.verificationStatus !== "") params.isVerified = filters.verificationStatus === "true";

      const response = await propertyService.getProperties(params);
      setProperties(response.data);
      setTotalPages(response.pagination.pages);
      setTotal(response.pagination.total);
    } catch {
      setError("Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await propertyService.deleteProperty(id);
      fetchProperties();
    } catch {
      alert("Failed to delete property");
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      propertyType: "",
      status: "",
      featured: "",
      active: "",
      verificationStatus: "",
    });
    setPage(1);
  };

  const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      AVAILABLE: "bg-green-500/20 text-green-400",
      SOLD: "bg-red-500/20 text-red-400",
      RESERVED: "bg-yellow-500/20 text-yellow-400",
      UNDER_CONTRACT: "bg-blue-500/20 text-blue-400",
    };
    return colors[status || ""] || "bg-gray-500/20 text-gray-400";
  };

  const getTypeColor = (type?: string) => {
    const colors: Record<string, string> = {
      PLOT: "bg-purple-500/20 text-purple-400",
      VILLA: "bg-pink-500/20 text-pink-400",
      APARTMENT: "bg-cyan-500/20 text-cyan-400",
      FARM_HOUSE: "bg-orange-500/20 text-orange-400",
      COMMERCIAL: "bg-indigo-500/20 text-indigo-400",
    };
    return colors[type || ""] || "bg-gray-500/20 text-gray-400";
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="p-4 md:p-6 text-white bg-background min-h-screen w-full">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">Properties</h1>
            <p className="text-gray-400 text-sm mt-1">{total} total properties</p>
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
            {canWrite && (
              <Button onClick={() => navigate("/property/create")} className="sm:w-auto w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex gap-2 flex-1">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search properties..."
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Property Type</label>
                <select
                  value={filters.propertyType}
                  onChange={(e) => handleFilterChange("propertyType", e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none text-white"
                >
                  <option value="">All Types</option>
                  <option value="PLOT">Plot</option>
                  <option value="VILLA">Villa</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="FARM_HOUSE">Farm House</option>
                  <option value="COMMERCIAL">Commercial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none text-white"
                >
                  <option value="">All Statuses</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="SOLD">Sold</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="UNDER_CONTRACT">Under Contract</option>
                </select>
              </div>
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
              <div>
                <label className="block text-sm text-gray-400 mb-1">Verification Status</label>
                <select
                  value={filters.verificationStatus}
                  onChange={(e) => handleFilterChange("verificationStatus", e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none text-white"
                >
                  <option value="">All</option>
                  <option value="false">Pending Verification</option>
                  <option value="true">Verified</option>
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
        ) : properties.length === 0 ? (
          <div className="p-6 text-center text-gray-400">No properties found</div>
        ) : (
          properties.map((property) => (
            <div
              key={property._id}
              className="bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-sm cursor-pointer hover:bg-gray-800"
              onClick={() => navigate(`/property/${property._id}`)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{property.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{(property.description_short || "").substring(0, 60)}...</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {property.pricing?.total_price?.display_value || (property.pricing?.total_price?.value ? `₹${property.pricing.total_price.value}` : "Price on Request")}
                  </p>
                </div>
                <div className="flex flex-col gap-2 ml-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${getStatusColor(property.project_info?.project_status || "AVAILABLE")}`}
                  >
                    {property.project_info?.project_status || "Available"}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${getTypeColor(property.property_type || property.propertyType)}`}
                  >
                    {property.property_type || property.propertyType || "Type"}
                  </span>
                  {!property.isVerified && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium shrink-0 bg-yellow-500/20 text-yellow-400">
                      Pending Verification
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center text-sm mb-3">
                <div>
                  <span className="text-gray-500">Area:</span>
                  <span className="text-gray-300 ml-1 font-medium">{property.area?.carpet_area_sqft || property.spatialDetails?.area?.carpet || 0} sq.ft</span>
                </div>
                {property.specifications?.bedrooms && (
                  <div>
                    <span className="text-gray-500">Bedrooms:</span>
                    <span className="text-gray-300 ml-1 font-medium">{property.specifications.bedrooms}</span>
                  </div>
                )}
              </div>
              {(canWrite || canApprove) && (
                <div className="flex gap-2 pt-3 border-t border-gray-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-blue-400 hover:text-blue-300"
                    onClick={(e) => { e.stopPropagation(); navigate(`/property/${property._id}/edit`); }}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-red-400 hover:text-red-300"
                    onClick={(e) => { e.stopPropagation(); handleDelete(property._id, property.title); }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                  {/* Onboarding Flow Buttons - Mobile */}
                  {(() => {
                    const ob = getOnboardingItem(property._id);
                    const status = property.isVerified ? 'Approved' : (ob?.status || 'Draft');

                    if (user?.role === 'onboarding_agent' && (status === 'Draft' || status === 'Rejected')) {
                      return (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
                          onClick={(e) => { e.stopPropagation(); handleSubmitForApproval(property._id); }}
                        >
                          Submit
                        </Button>
                      );
                    }

                    if (canApprove && status === 'Submitted') {
                      return (
                        <div className="flex flex-1 gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-500 text-white"
                            onClick={(e) => { e.stopPropagation(); handleApprove(property); }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1 bg-red-600 hover:bg-red-500 text-white"
                            onClick={(e) => { e.stopPropagation(); handleReject(property); }}
                          >
                            Reject
                          </Button>
                        </div>
                      );
                    }

                    return null;
                  })()}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block overflow-x-auto rounded border border-gray-700">
        <table className="w-full text-left">
          <thead className="bg-gray-900 text-gray-300">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Type</th>
              <th className="p-3">Price</th>
              <th className="p-3">Area</th>
              <th className="p-3">Status</th>
              <th className="p-3">Approval</th>
              <th className="p-3">Featured</th>
              <th className="p-3">Views</th>
              {(canWrite || canApprove) && <th className="p-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : properties.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-400">
                  No properties found
                </td>
              </tr>
            ) : (
              properties.map((property) => (
                <tr
                  key={property._id}
                  className="border-t border-gray-700 hover:bg-gray-800 cursor-pointer"
                  onClick={() => navigate(`/property/${property._id}`)}
                >
                  <td className="p-3 font-medium">{property.title}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${getTypeColor(property.property_type || property.propertyType)}`}>
                      {property.property_type || property.propertyType || "N/A"}
                    </span>
                  </td>
                  <td className="p-3">
                    {property.pricing?.total_price?.display_value || (property.pricing?.total_price?.value ? `₹${property.pricing.total_price.value}` : "N/A")}
                  </td>
                  <td className="p-3">{property.area?.carpet_area_sqft || property.spatialDetails?.area?.carpet || 0} sq.ft</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(property.project_info?.project_status || "AVAILABLE")}`}
                    >
                      {property.project_info?.project_status || "Available"}
                    </span>
                  </td>
                  <td className="p-3">
                    {(() => {
                      const ob = getOnboardingItem(property._id);
                      const status = property.isVerified ? 'Approved' : (ob?.status || 'Draft');

                      const colors: Record<string, string> = {
                        Draft: "bg-gray-500/20 text-gray-400",
                        Submitted: "bg-yellow-500/20 text-yellow-400",
                        Approved: "bg-green-500/20 text-green-400",
                        Rejected: "bg-red-500/20 text-red-400",
                      };

                      return (
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] w-fit ${colors[status]}`}>
                            {status}
                          </span>
                          {status === 'Rejected' && ob?.rejectionReason && (
                            <span className="text-[9px] text-red-300 italic max-w-[120px] truncate" title={ob.rejectionReason}>
                              {ob.rejectionReason}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="p-3">
                    {property.badges?.is_featured ? (
                      <span className="text-yellow-400">★</span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="p-3">{property.engagement?.views_count || 0}</td>
                  {(canWrite || canApprove) && (
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-400 hover:text-blue-300"
                          onClick={(e) => { e.stopPropagation(); navigate(`/property/${property._id}/edit`); }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                          onClick={(e) => { e.stopPropagation(); handleDelete(property._id, property.title); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        {/* Onboarding Flow Buttons */}
                        {(() => {
                          const ob = getOnboardingItem(property._id);
                          const status = property.isVerified ? 'Approved' : (ob?.status || 'Draft');

                          if (user?.role === 'onboarding_agent' && (status === 'Draft' || status === 'Rejected')) {
                            return (
                              <Button
                                variant="secondary"
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-500 text-white"
                                onClick={(e) => { e.stopPropagation(); handleSubmitForApproval(property._id); }}
                              >
                                Submit
                              </Button>
                            );
                          }

                          if (canApprove && status === 'Submitted') {
                            return (
                              <div className="flex gap-1">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-500 text-white"
                                  onClick={(e) => { e.stopPropagation(); handleApprove(property); }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="bg-red-600 hover:bg-red-500 text-white"
                                  onClick={(e) => { e.stopPropagation(); handleReject(property); }}
                                >
                                  Reject
                                </Button>
                              </div>
                            );
                          }

                          return null;
                        })()}
                      </div>
                    </td>
                  )}
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
    </div>
  );
};

export default PropertiesPage;
