import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, ChevronLeft, ChevronRight, Edit2, Trash2 } from "lucide-react";
import { leadService } from "../../services/leadService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Lead } from "@/types";

const PAGE_SIZE = 10;

const LeadsPage: React.FC = () => {
  const navigate = useNavigate();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await leadService.getLeads(page, PAGE_SIZE, search);
      setLeads(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch {
      setError("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-500/20 text-blue-400";
      case "Contacted":
        return "bg-cyan-500/20 text-cyan-400";
      case "Qualified":
        return "bg-green-500/20 text-green-400";
      case "Shortlisted":
        return "bg-yellow-500/20 text-yellow-400";
      case "Site Visit":
        return "bg-purple-500/20 text-purple-400";
      case "Negotiation":
        return "bg-orange-500/20 text-orange-400";
      case "Booked":
        return "bg-pink-500/20 text-pink-400";
      case "Lost":
        return "bg-red-500/20 text-red-400";
      case "Converted":
        return "bg-emerald-500/20 text-emerald-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="p-4 md:p-6 text-white bg-background min-h-screen w-full">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">Leads</h1>
            <p className="text-gray-400 text-sm mt-1">{total} total leads</p>
          </div>

          <Button onClick={() => navigate('/leads/create')} className="sm:w-auto w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex gap-2 flex-1">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search leads..."
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
        ) : leads.length === 0 ? (
          <div className="p-6 text-center text-gray-400">No leads found</div>
        ) : (
          leads.map((lead) => (
            <div
              key={lead._id}
              onClick={() => navigate(`/leads/${lead._id}`)}
              className="bg-gray-900 border border-gray-700 rounded-xl p-4 cursor-pointer active:bg-gray-800 hover:bg-gray-800/50 transition-colors shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{lead.identity.fullName}</h3>
                  <p className="text-sm text-gray-400 mt-1">{lead.identity.phone}</p>
                  <p className="text-sm text-gray-500 mt-1">{lead.identity.email || "No email"}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 shrink-0 ${getStatusColor(lead.system.leadStatus)}`}>
                  {lead.system.leadStatus}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mb-3">
                <div>
                  <span className="text-gray-500">Budget:</span>
                  <p className="text-gray-300 font-medium">{lead.propertyVision.budgetRange || "-"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Agent:</span>
                  <p className="text-gray-300 font-medium truncate">
                    {lead.system.assignedAgent?.name || "Unassigned"}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-3 border-t border-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-blue-400 hover:text-blue-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/leads/${lead._id}/edit`);
                  }}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-red-400 hover:text-red-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Are you sure you want to delete ${lead.identity.fullName}?`)) {
                      // TODO: Implement delete functionality
                      console.log('Delete lead:', lead._id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
              {lead.propertyVision.journeyStage && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <span className="text-gray-500 text-sm">Stage:</span>
                  <p className="text-gray-300 font-medium">{lead.propertyVision.journeyStage}</p>
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
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3">Budget</th>
              <th className="p-3">Journey Stage</th>
              <th className="p-3">Assigned Agent</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-400">
                  No leads found
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead._id}
                  className="border-t border-gray-700 hover:bg-gray-800 cursor-pointer"
                  onClick={() => navigate(`/leads/${lead._id}`)}
                >
                  <td className="p-3 font-medium">{lead.identity.fullName}</td>
                  <td className="p-3">{lead.identity.phone}</td>
                  <td className="p-3">{lead.identity.email || "-"}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(lead.system.leadStatus)}`}>
                      {lead.system.leadStatus}
                    </span>
                  </td>
                  <td className="p-3">{lead.propertyVision.budgetRange || "-"}</td>
                  <td className="p-3">{lead.propertyVision.journeyStage || "-"}</td>
                  <td className="p-3">{lead.system.assignedAgent?.name || "-"}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-400 hover:text-blue-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/leads/${lead._id}/edit`);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Are you sure you want to delete ${lead.identity.fullName}?`)) {
                            // TODO: Implement delete functionality
                            console.log('Delete lead:', lead._id);
                          }
                        }}
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

    </div>
  );
};

export default LeadsPage;
