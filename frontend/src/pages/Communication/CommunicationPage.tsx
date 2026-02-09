import React, { useState, useEffect, useCallback } from "react";
import { Send, MessageSquare, Mail, FileText, Phone, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import communicationService, {
  type Communication,
  type CommunicationChannel,
  type CreateCommunicationInput,
} from "@/services/communicationService";
import { leadService } from "@/services/leadService";
import { type Lead } from "@/types";

const PAGE_SIZE = 10;

const CommunicationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CommunicationChannel | "all">("all");
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sending, setSending] = useState(false);

  // Lead search state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadSearch, setLeadSearch] = useState("");
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    channel: "email" as CommunicationChannel,
    subject: "",
    message: "",
    toName: "",
    toEmail: "",
    toPhone: "",
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Fetch leads for selection
  const searchLeads = useCallback(async (search: string) => {
    if (!search.trim()) {
      setLeads([]);
      return;
    }
    setLoadingLeads(true);
    try {
      const response = await leadService.getLeads(1, 20, search);
      setLeads(response.leads);
    } catch (error) {
      console.error("Failed to search leads:", error);
    } finally {
      setLoadingLeads(false);
    }
  }, []);

  // Debounced lead search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchLeads(leadSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [leadSearch, searchLeads]);

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setFormData((prev) => ({
      ...prev,
      toName: `${lead.identity?.firstName || ""} ${lead.identity?.lastName || ""}`.trim() || "Recipient",
      toEmail: lead.identity?.email || "",
      toPhone: lead.identity?.phone || "",
    }));
    setLeadSearch("");
    setLeads([]);
  };

  const fetchCommunications = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      };
      if (activeTab !== "all") {
        params.channel = activeTab;
      }
      const response = await communicationService.getCommunications(params);
      setCommunications(response.data);
      setTotalPages(response.pagination.pages || 1);
    } catch (error) {
      console.error("Failed to fetch communications:", error);
    } finally {
      setLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => {
    fetchCommunications();
  }, [fetchCommunications]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as CommunicationChannel | "all");
    setPage(1);
    // Update form channel based on tab
    if (value !== "all") {
      setFormData((prev) => ({ ...prev, channel: value as CommunicationChannel }));
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) return;

    setSending(true);
    try {
      const input: CreateCommunicationInput = {
        channel: formData.channel,
        direction: "outbound",
        subject: formData.subject || undefined,
        message: formData.message,
        from: {
          name: user.name || "Agent",
          email: user.email,
        },
        to: [
          {
            name: formData.toName || "Recipient",
            email: formData.toEmail || undefined,
            phone: formData.toPhone || undefined,
          },
        ],
        related_to: selectedLead ? {
          type: "lead",
          id: selectedLead._id,
        } : {
          type: "lead",
          id: "000000000000000000000000",
        },
      };

      await communicationService.createCommunication(input);
      setFormData({
        channel: formData.channel,
        subject: "",
        message: "",
        toName: "",
        toEmail: "",
        toPhone: "",
      });
      setSelectedLead(null);
      fetchCommunications();
    } catch (error) {
      console.error("Failed to send:", error);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const getChannelIcon = (channel: CommunicationChannel) => {
    switch (channel) {
      case "whatsapp":
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case "email":
        return <Mail className="h-4 w-4 text-blue-500" />;
      case "call":
        return <Phone className="h-4 w-4 text-purple-500" />;
      case "sms":
        return <FileText className="h-4 w-4 text-orange-500" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-blue-500/20 text-blue-400";
      case "delivered":
        return "bg-green-500/20 text-green-400";
      case "read":
        return "bg-emerald-500/20 text-emerald-400";
      case "failed":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="p-4 md:p-6 bg-background min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Communication Hub</h1>
        <p className="text-gray-400">Manage all your communications in one place</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="bg-gray-800 border border-gray-700">
          <TabsTrigger value="all" className="data-[state=active]:bg-gray-700">
            All
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="data-[state=active]:bg-green-900/50">
            <MessageSquare className="h-4 w-4 mr-2" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="email" className="data-[state=active]:bg-blue-900/50">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="sms" className="data-[state=active]:bg-orange-900/50">
            <FileText className="h-4 w-4 mr-2" />
            Notes/SMS
          </TabsTrigger>
        </TabsList>

        {/* Send Message Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send {formData.channel === "email" ? "Email" : formData.channel === "whatsapp" ? "WhatsApp" : "Message"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm text-gray-400 mb-1">Select Lead *</label>
                  {selectedLead ? (
                    <div className="flex items-center justify-between p-3 bg-gray-800 border border-gray-700 rounded-md">
                      <div>
                        <p className="font-medium text-white">{selectedLead.identity?.firstName} {selectedLead.identity?.lastName}</p>
                        <p className="text-sm text-gray-400">{selectedLead.identity?.email || selectedLead.identity?.phone}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedLead(null);
                          setFormData((prev) => ({
                            ...prev,
                            toName: "",
                            toEmail: "",
                            toPhone: "",
                          }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          value={leadSearch}
                          onChange={(e) => setLeadSearch(e.target.value)}
                          placeholder="Search leads by name, email, or phone..."
                          className="pl-9 bg-gray-800 border-gray-700"
                        />
                      </div>
                      {loadingLeads ? (
                        <p className="text-sm text-gray-400 p-2">Searching...</p>
                      ) : leads.length > 0 ? (
                        <div className="max-h-40 overflow-y-auto border border-gray-700 rounded-md bg-gray-800">
                          {leads.map((lead) => (
                            <button
                              key={lead._id}
                              type="button"
                              onClick={() => handleSelectLead(lead)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-700 border-b border-gray-700 last:border-0"
                            >
                              <p className="font-medium text-sm text-white">
                                {lead.identity?.firstName} {lead.identity?.lastName}
                              </p>
                              <p className="text-xs text-gray-400">
                                {lead.identity?.email || lead.identity?.phone}
                              </p>
                            </button>
                          ))}
                        </div>
                      ) : leadSearch ? (
                        <p className="text-sm text-gray-400 p-2">No leads found</p>
                      ) : null}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Channel</label>
                  <select
                    value={formData.channel}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, channel: e.target.value as CommunicationChannel }))
                    }
                    className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white h-[40px]"
                  >
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="sms">SMS/Notes</option>
                    <option value="call">Call Log</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Recipient Name</label>
                  <Input
                    value={formData.toName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, toName: e.target.value }))}
                    placeholder="Auto-populated from lead"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1 text-blue-400">Email (Required for Email)</label>
                  <Input
                    type="email"
                    value={formData.toEmail}
                    onChange={(e) => setFormData((prev) => ({ ...prev, toEmail: e.target.value }))}
                    placeholder="recipient@example.com"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1 text-green-400">Phone (Required for WhatsApp)</label>
                  <Input
                    value={formData.toPhone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, toPhone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>

              {formData.channel === "email" && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Subject</label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                    placeholder="Email subject"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-1">Message</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="Type your message..."
                  rows={4}
                  className="bg-gray-800 border-gray-700"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={sending || !formData.message.trim()}>
                  {sending ? "Sending..." : "Send"}
                  <Send className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Communications List */}
        <TabsContent value={activeTab} className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {activeTab === "all" ? "All Communications" : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Messages`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : communications.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No communications found</div>
              ) : (
                <div className="space-y-3">
                  {communications.map((comm) => (
                    <div
                      key={comm._id}
                      className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                    >
                      <div className="mt-1">{getChannelIcon(comm.channel)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-white">
                            {comm.direction === "outbound" ? `To: ${comm.to[0]?.name}` : `From: ${comm.from.name}`}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(comm.status)}`}>
                            {comm.status}
                          </span>
                          <span className="text-xs text-gray-500">{formatDate(comm.created_at)}</span>
                        </div>
                        {comm.subject && <p className="text-sm text-gray-300 font-medium mt-1">{comm.subject}</p>}
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{comm.message}</p>
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs ${comm.direction === "outbound" ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"
                          }`}
                      >
                        {comm.direction}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-6">
                  <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-400">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationPage;
